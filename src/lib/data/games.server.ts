import { createClient, createServiceRoleClient, hasSupabaseEnv } from '@/lib/supabase/server'

export interface GameListItem {
  id: string
  title: string
  platform: string | null
  category: string | null
  coverUrl: string | null
  service: string | null
  playCount: number | null
  playDurationSeconds: number | null
  firstPlayedAt: string | null
  lastPlayedAt: string | null
  trophyProgress: number | null
  earnedTrophies: TrophyCounts | null
  definedTrophies: TrophyCounts | null
}

export interface GameListSummary {
  totalGames: number
  trophyTitles: number
  totalPlaySeconds: number
  lastSyncedAt: string | null
}

export interface GamesData {
  games: GameListItem[]
  summary: GameListSummary
}

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

type TrophyCounts = {
  bronze?: number
  silver?: number
  gold?: number
  platinum?: number
}

type GameRow = {
  id: string
  title: string
  localized_title: string | null
  platform: string | null
  category: string | null
  cover_url: string | null
  psn_concept_name: string | null
}

type ProgressRow = {
  game_id: string
  service: string | null
  play_count: number | null
  play_duration_seconds: number | null
  first_played_at: string | null
  last_played_at: string | null
}

type TrophyTitleRow = {
  game_id: string | null
  name: string
  platform: string | null
  progress: number | null
  earned_trophies: TrophyCounts | null
  defined_trophies: TrophyCounts | null
  last_updated_at: string | null
}

type PsnAccountRow = {
  last_synced_at: string | null
}

const excludedCategories = new Set([
  'ps5_native_media_app',
  'ps5_web_based_media_app',
  'ps4_videoservice_web_app',
])

const excludedTitles = new Set(['apple music', 'apple tv', 'netflix'])

export async function getGamesData(): Promise<GamesData> {
  if (!hasSupabaseEnv) return emptyGamesData()

  try {
    const supabase = await getReadableClient()
    const { data: progressData, error: progressError } = await supabase
      .from('psn_game_progress')
      .select('game_id, service, play_count, play_duration_seconds, first_played_at, last_played_at')
      .order('last_played_at', { ascending: false, nullsFirst: false })

    if (progressError) return emptyGamesData()

    const progressRows = (progressData ?? []) as ProgressRow[]
    const gameIds = progressRows.map((row) => row.game_id)

    if (gameIds.length === 0) return emptyGamesData()

    const [
      { data: gamesData, error: gamesError },
      { data: trophyData, error: trophyError },
      { data: accountData, error: accountError },
    ] = await Promise.all([
      supabase
        .from('games')
        .select('id, title, localized_title, platform, category, cover_url, psn_concept_name')
        .in('id', gameIds),
      supabase
        .from('psn_trophy_titles')
        .select('game_id, name, platform, progress, earned_trophies, defined_trophies, last_updated_at'),
      supabase
        .from('psn_accounts')
        .select('last_synced_at')
        .order('last_synced_at', { ascending: false, nullsFirst: false })
        .limit(1),
    ])

    if (gamesError || trophyError || accountError) return emptyGamesData()

    const gameById = new Map(((gamesData ?? []) as GameRow[]).map((game) => [game.id, game]))
    const trophyRows = (trophyData ?? []) as TrophyTitleRow[]
    const accountRows = (accountData ?? []) as PsnAccountRow[]
    const trophyByGameId = buildTrophyMap(trophyRows)
    const trophyByName = buildTrophyNameMap(trophyRows)

    const games = progressRows
      .map((progress) => {
        const game = gameById.get(progress.game_id)
        if (!game) return null
        if (game.category && excludedCategories.has(game.category)) return null
        if (excludedTitles.has(normalizeTitle(game.title))) return null

        const trophyTitle = trophyByGameId.get(game.id) ?? trophyByName.get(normalizeTitle(game.title))

        return {
          id: game.id,
          title: game.localized_title ?? game.title,
          platform: trophyTitle?.platform ?? game.platform,
          category: game.category,
          coverUrl: game.cover_url,
          service: progress.service,
          playCount: progress.play_count,
          playDurationSeconds: progress.play_duration_seconds,
          firstPlayedAt: progress.first_played_at,
          lastPlayedAt: progress.last_played_at,
          trophyProgress: trophyTitle?.progress ?? null,
          earnedTrophies: trophyTitle?.earned_trophies ?? null,
          definedTrophies: trophyTitle?.defined_trophies ?? null,
        }
      })
      .filter((game): game is GameListItem => Boolean(game))

    return {
      games,
      summary: {
        totalGames: games.length,
        trophyTitles: trophyRows.length,
        totalPlaySeconds: games.reduce((total, game) => total + (game.playDurationSeconds ?? 0), 0),
        lastSyncedAt: accountRows[0]?.last_synced_at ?? null,
      },
    }
  } catch {
    return emptyGamesData()
  }
}

async function getReadableClient(): Promise<SupabaseClient> {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createServiceRoleClient()
  }

  return createClient()
}

function buildTrophyMap(rows: TrophyTitleRow[]) {
  const byGameId = new Map<string, TrophyTitleRow>()

  for (const row of rows) {
    if (!row.game_id) continue
    const current = byGameId.get(row.game_id)
    if (!current || compareTrophyRows(row, current) > 0) {
      byGameId.set(row.game_id, row)
    }
  }

  return byGameId
}

function buildTrophyNameMap(rows: TrophyTitleRow[]) {
  const byName = new Map<string, TrophyTitleRow>()

  for (const row of rows) {
    const key = normalizeTitle(row.name)
    const current = byName.get(key)
    if (!current || compareTrophyRows(row, current) > 0) {
      byName.set(key, row)
    }
  }

  return byName
}

function compareTrophyRows(a: TrophyTitleRow, b: TrophyTitleRow) {
  return Date.parse(a.last_updated_at ?? '') - Date.parse(b.last_updated_at ?? '')
}

function normalizeTitle(value: string) {
  return value
    .toLowerCase()
    .replace(/[™®©]/g, '')
    .replace(/[:：\-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function emptyGamesData(): GamesData {
  return {
    games: [],
    summary: {
      totalGames: 0,
      trophyTitles: 0,
      totalPlaySeconds: 0,
      lastSyncedAt: null,
    },
  }
}
