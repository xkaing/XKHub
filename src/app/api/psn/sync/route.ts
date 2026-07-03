import { execFile } from 'node:child_process'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 180

const execFileAsync = promisify(execFile)

type TrophyCounts = {
  bronze?: number
  silver?: number
  gold?: number
  platinum?: number
}

type TrophySummary = {
  earnedTrophies?: TrophyCounts
}

type PsnAccountRow = {
  id: string
  online_id: string | null
  trophy_summary: TrophySummary | null
  raw_profile: Record<string, unknown> | null
  last_synced_at: string | null
}

type PsnTrophyTitleRow = {
  game_id: string | null
  np_communication_id: string
  name: string
  platform: string | null
  icon_url: string | null
  progress: number | null
  earned_trophies: TrophyCounts | null
  defined_trophies: TrophyCounts | null
  last_updated_at: string | null
  raw_psn: Record<string, unknown> | null
}

type PsnGameProgressRow = {
  game_id: string
  play_count: number | null
  play_duration_seconds: number | null
  last_played_at: string | null
  raw_psn: Record<string, unknown> | null
}

type GameRow = {
  id: string
  title: string
  localized_title: string | null
  category: string | null
  cover_url: string | null
  psn_concept_name: string | null
}

export async function POST(request: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      {
        error: '服务器缺少 Supabase URL 或 service role key。',
      },
      { status: 400 }
    )
  }

  try {
    const payload = (await request.json().catch(() => ({}))) as {
      npsso?: string
      saveMonthlySnapshot?: boolean
    }
    const npsso = payload.npsso?.trim()

    if (payload.saveMonthlySnapshot) {
      const snapshot = await saveSnapshotFromStoredPsnData()

      revalidatePath('/games')
      revalidatePath('/monthly')

      return NextResponse.json({
        message: `已记录快照（上次同步：${formatShanghaiDate(snapshot.lastSyncedAt)}，${snapshot.gameCount} 个游戏）。`,
      })
    }

    const scriptArgs = [
      'scripts/psn-sync.mjs',
      '--sync-supabase',
      '--save-tokens',
      '--use-stored-tokens',
      '--out',
      path.join(tmpdir(), 'latest-supabase-sync.json'),
    ]

    await execFileAsync(
      process.execPath,
      scriptArgs,
      {
        cwd: process.cwd(),
        env: npsso ? { ...process.env, PSN_NPSSO: npsso } : process.env,
        timeout: 180000,
        maxBuffer: 1024 * 1024 * 10,
      }
    )

    revalidatePath('/games')
    revalidatePath('/monthly')

    return NextResponse.json({
      message: '同步完成，列表已刷新。',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '同步失败'

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    )
  }
}

async function saveSnapshotFromStoredPsnData() {
  const supabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: accountData, error: accountError } = await supabase
    .from('psn_accounts')
    .select('id, online_id, trophy_summary, raw_profile, last_synced_at')
    .order('last_synced_at', { ascending: false, nullsFirst: false })
    .limit(1)

  if (accountError) throw accountError

  const account = (accountData?.[0] ?? null) as PsnAccountRow | null
  if (!account?.last_synced_at) {
    throw new Error('还没有可记录的 PSN 同步数据。请先同步一次 PSN 数据。')
  }

  const [{ data: trophyData, error: trophyError }, { data: progressData, error: progressError }] =
    await Promise.all([
      supabase
        .from('psn_trophy_titles')
        .select(
          'game_id, np_communication_id, name, platform, icon_url, progress, earned_trophies, defined_trophies, last_updated_at, raw_psn'
        )
        .eq('psn_account_id', account.id),
      supabase
        .from('psn_game_progress')
        .select('game_id, play_count, play_duration_seconds, last_played_at, raw_psn')
        .eq('psn_account_id', account.id),
    ])

  if (trophyError) throw trophyError
  if (progressError) throw progressError

  const trophyRows = (trophyData ?? []) as PsnTrophyTitleRow[]
  const progressRows = (progressData ?? []) as PsnGameProgressRow[]
  if (trophyRows.length === 0) {
    throw new Error('当前数据库里还没有 PSN 奖杯标题数据，暂时不能记录快照。')
  }

  const gameIds = Array.from(
    new Set([
      ...trophyRows.map((row) => row.game_id).filter((id): id is string => Boolean(id)),
      ...progressRows.map((row) => row.game_id),
    ])
  )
  const games = gameIds.length > 0 ? await getSnapshotGames(supabase, gameIds) : []
  const gameById = new Map(games.map((game) => [game.id, game]))
  const gameByTitle = buildGameTitleMap(games)
  const progressByGameId = new Map(progressRows.map((progress) => [progress.game_id, progress]))
  const snapshotDate = getShanghaiDateValue(account.last_synced_at)
  const now = new Date()

  const { data: snapshotData, error: snapshotError } = await supabase
    .from('psn_monthly_snapshots')
    .upsert(
      {
        psn_account_id: account.id,
        snapshot_date: snapshotDate,
        captured_at: now.toISOString(),
        online_id: account.online_id,
        trophy_summary: account.trophy_summary ?? {},
        total_play_seconds: progressRows.reduce((total, progress) => total + (progress.play_duration_seconds ?? 0), 0),
        total_earned_trophies: account.trophy_summary?.earnedTrophies ?? {},
        raw_account: {
          profile: account.raw_profile ?? {},
          trophySummary: account.trophy_summary ?? {},
        },
      },
      { onConflict: 'psn_account_id,snapshot_date' }
    )
    .select('id')
    .single()

  if (snapshotError) throw snapshotError

  const snapshotId = (snapshotData as { id: string }).id
  const snapshotGameRows = trophyRows.map((title) => {
    const game = findSnapshotGameForTrophyTitle(title, gameById, gameByTitle, progressByGameId)
    const progress = game ? progressByGameId.get(game.id) : null

    return {
      snapshot_id: snapshotId,
      psn_account_id: account.id,
      game_id: game?.id ?? title.game_id,
      np_communication_id: title.np_communication_id,
      title: title.name,
      platform: title.platform,
      category: game?.category ?? null,
      cover_url: title.icon_url ?? game?.cover_url ?? null,
      play_count: progress?.play_count ?? null,
      play_duration_seconds: progress?.play_duration_seconds ?? null,
      last_played_at: progress?.last_played_at ?? null,
      trophy_progress: title.progress,
      earned_trophies: title.earned_trophies ?? {},
      defined_trophies: title.defined_trophies ?? {},
      last_updated_at: title.last_updated_at,
      raw_trophy_title: title.raw_psn ?? {},
      raw_game_progress: progress?.raw_psn ?? {},
    }
  })

  const { error: deleteError } = await supabase
    .from('psn_monthly_snapshot_games')
    .delete()
    .eq('snapshot_id', snapshotId)

  if (deleteError) throw deleteError

  if (snapshotGameRows.length > 0) {
    const { error: snapshotGamesError } = await supabase
      .from('psn_monthly_snapshot_games')
      .upsert(snapshotGameRows, { onConflict: 'snapshot_id,np_communication_id' })

    if (snapshotGamesError) throw snapshotGamesError
  }

  return {
    snapshotDate,
    lastSyncedAt: account.last_synced_at,
    gameCount: snapshotGameRows.length,
  }
}

async function getSnapshotGames(
  supabase: SupabaseClient,
  gameIds: string[]
): Promise<GameRow[]> {
  const { data, error } = await supabase
    .from('games')
    .select('id, title, localized_title, category, cover_url, psn_concept_name')
    .in('id', gameIds)

  if (error) throw error
  return (data ?? []) as GameRow[]
}

function findSnapshotGameForTrophyTitle(
  trophyTitle: PsnTrophyTitleRow,
  gameById: Map<string, GameRow>,
  gameByTitle: Map<string, GameRow[]>,
  progressByGameId: Map<string, PsnGameProgressRow>
) {
  const candidatesById = new Map<string, GameRow>()
  const linkedGame = trophyTitle.game_id ? gameById.get(trophyTitle.game_id) ?? null : null
  if (linkedGame) candidatesById.set(linkedGame.id, linkedGame)

  for (const candidate of gameByTitle.get(normalizeTitle(trophyTitle.name)) ?? []) {
    candidatesById.set(candidate.id, candidate)
  }

  const candidates = Array.from(candidatesById.values())
  if (candidates.length <= 1) return candidates[0] ?? null

  const trophyTime = Date.parse(trophyTitle.last_updated_at ?? '')

  return candidates
    .slice()
    .sort((a, b) => {
      const aProgress = progressByGameId.get(a.id)
      const bProgress = progressByGameId.get(b.id)
      const aDuration = aProgress?.play_duration_seconds ?? 0
      const bDuration = bProgress?.play_duration_seconds ?? 0

      if (aDuration !== bDuration) return bDuration - aDuration

      const aPlayCount = aProgress?.play_count ?? 0
      const bPlayCount = bProgress?.play_count ?? 0

      if (aPlayCount !== bPlayCount) return bPlayCount - aPlayCount

      const aDistance = getTimeDistance(aProgress?.last_played_at, trophyTime)
      const bDistance = getTimeDistance(bProgress?.last_played_at, trophyTime)

      if (aDistance !== bDistance) return aDistance - bDistance
      return Date.parse(bProgress?.last_played_at ?? '') - Date.parse(aProgress?.last_played_at ?? '')
    })[0]
}

function buildGameTitleMap(rows: GameRow[]) {
  const byTitle = new Map<string, GameRow[]>()

  for (const row of rows) {
    for (const title of [row.title, row.localized_title, row.psn_concept_name]) {
      if (!title) continue
      const key = normalizeTitle(title)
      const current = byTitle.get(key) ?? []
      current.push(row)
      byTitle.set(key, current)
    }
  }

  return byTitle
}

function normalizeTitle(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function getTimeDistance(value: string | null | undefined, targetTime: number) {
  const time = Date.parse(value ?? '')
  if (!Number.isFinite(time) || !Number.isFinite(targetTime)) return Number.MAX_SAFE_INTEGER
  return Math.abs(time - targetTime)
}

function getShanghaiDateValue(value: string) {
  return new Date(Date.parse(value) + 8 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

function formatShanghaiDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}
