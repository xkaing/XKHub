import { createClient, createServiceRoleClient, hasSupabaseEnv } from '@/lib/supabase/server'

export interface GameListItem {
  id: string
  title: string
  platform: string | null
  category: string | null
  coverUrl: string | null
  playCount: number | null
  playDurationSeconds: number | null
  lastPlayedAt: string | null
  lastUpdatedAt: string | null
  hasTrophyGroups: boolean
  trophyProgress: number | null
  earnedTrophies: TrophyCounts | null
  definedTrophies: TrophyCounts | null
}

export interface GameListSummary {
  totalGames: number
  trophyTitles: number
  totalPlaySeconds: number
  completedGames: number
  lastSyncedAt: string | null
  account: PsnAccountSummary | null
}

export interface GamesData {
  games: GameListItem[]
  summary: GameListSummary
}

export interface MonthlyPsnSnapshotActivity {
  monthValue: string
  startSnapshot: PsnSnapshotSummary | null
  endSnapshot: PsnSnapshotSummary | null
  games: MonthlyPsnGameDelta[]
  totalPlaySeconds: number
  earnedTrophies: Required<TrophyCounts>
  totalEarnedTrophies: number
  platinumTrophies: number
}

export interface MonthlyPsnGameDelta {
  id: string
  title: string
  platform: string | null
  category: string | null
  coverUrl: string | null
  playCountDelta: number
  playDurationSecondsDelta: number
  trophyProgress: number | null
  earnedTrophiesDelta: Required<TrophyCounts>
  totalEarnedTrophiesDelta: number
  platinumTrophiesDelta: number
  lastPlayedAt: string | null
  lastUpdatedAt: string | null
}

export interface PsnSnapshotSummary {
  id: string
  snapshotDate: string
  capturedAt: string
  onlineId: string | null
  totalPlaySeconds: number
  totalEarnedTrophies: TrophyCounts | null
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
  play_count: number | null
  play_duration_seconds: number | null
  last_played_at: string | null
}

type TrophyTitleRow = {
  np_communication_id: string
  game_id: string | null
  name: string
  platform: string | null
  icon_url: string | null
  has_trophy_groups: boolean | null
  progress: number | null
  earned_trophies: TrophyCounts | null
  defined_trophies: TrophyCounts | null
  last_updated_at: string | null
}

type TitleLinkRow = {
  np_communication_id: string
  game_id: string
  psn_title_id: string | null
  match_method: string
  match_confidence: number | string | null
  verified: boolean
}

type PsnAccountRow = {
  online_id: string | null
  avatar_url: string | null
  trophy_summary: TrophySummary | null
  last_synced_at: string | null
}

export type TrophySummary = {
  tier?: number
  progress?: number
  trophyLevel?: number
  trophyPoint?: number
  earnedTrophies?: TrophyCounts
  trophyLevelBasePoint?: number
  trophyLevelNextPoint?: number
}

type MonthlySnapshotRow = {
  id: string
  snapshot_date: string
  captured_at: string
  online_id: string | null
  total_play_seconds: number | null
  total_earned_trophies: TrophyCounts | null
}

type MonthlySnapshotGameRow = {
  snapshot_id: string
  game_id: string | null
  np_communication_id: string
  title: string
  platform: string | null
  category: string | null
  cover_url: string | null
  play_count: number | null
  play_duration_seconds: number | null
  last_played_at: string | null
  trophy_progress: number | null
  earned_trophies: TrophyCounts | null
  defined_trophies: TrophyCounts | null
  last_updated_at: string | null
}

export type PsnAccountSummary = {
  onlineId: string | null
  avatarUrl: string | null
  trophySummary: TrophySummary | null
}

const excludedCategories = new Set([
  'ps5_native_media_app',
  'ps5_web_based_media_app',
  'ps4_videoservice_web_app',
])

const excludedTitles = new Set(['apple music', 'apple tv', 'netflix'])

const excludedSummaryPlayDurationTitles = new Set(['monster hunter world iceborne'])

const shanghaiOffsetMs = 8 * 60 * 60 * 1000

export async function getGamesData(): Promise<GamesData> {
  if (!hasSupabaseEnv) return emptyGamesData()

  try {
    const supabase = await getReadableClient()
    const [
      { data: trophyData, error: trophyError },
      { data: accountData, error: accountError },
    ] = await Promise.all([
      supabase
        .from('psn_trophy_titles')
        .select(
          'np_communication_id, game_id, name, platform, icon_url, has_trophy_groups, progress, earned_trophies, defined_trophies, last_updated_at'
        )
        .order('last_updated_at', { ascending: false, nullsFirst: false }),
      supabase
        .from('psn_accounts')
        .select('online_id, avatar_url, trophy_summary, last_synced_at')
        .order('last_synced_at', { ascending: false, nullsFirst: false })
        .limit(1),
    ])

    if (trophyError || accountError) return emptyGamesData()

    const trophyRows = (trophyData ?? []) as TrophyTitleRow[]
    const accountRows = (accountData ?? []) as PsnAccountRow[]
    if (trophyRows.length === 0) return emptyGamesData()

    const [
      { data: gamesData, error: gamesError },
      { data: progressData, error: progressError },
      { data: linkData, error: linkError },
    ] = await Promise.all([
      supabase
        .from('games')
        .select('id, title, localized_title, platform, category, cover_url, psn_concept_name'),
      supabase
        .from('psn_game_progress')
        .select('game_id, play_count, play_duration_seconds, last_played_at'),
      supabase
        .from('psn_title_links')
        .select('np_communication_id, game_id, psn_title_id, match_method, match_confidence, verified'),
    ])

    if (gamesError || progressError) return emptyGamesData()

    const gameRows = (gamesData ?? []) as GameRow[]
    const progressRows = (progressData ?? []) as ProgressRow[]
    const titleLinkRows = linkError ? [] : ((linkData ?? []) as TitleLinkRow[])
    const gameById = new Map(gameRows.map((game) => [game.id, game]))
    const gameByTitle = buildGameTitleMap(gameRows)
    const progressByGameId = new Map(progressRows.map((progress) => [progress.game_id, progress]))
    const verifiedLinkByCommunicationId = new Map(
      titleLinkRows
        .filter((link) => link.verified)
        .map((link) => [link.np_communication_id, link])
    )

    const games = trophyRows
      .map((trophyTitle) => {
        const verifiedLink = verifiedLinkByCommunicationId.get(trophyTitle.np_communication_id)
        const game = verifiedLink
          ? gameById.get(verifiedLink.game_id) ?? null
          : findGameForTrophyTitle(trophyTitle, gameById, gameByTitle, progressByGameId)
        if (game?.category && excludedCategories.has(game.category)) return null
        if (game && excludedTitles.has(normalizeTitle(game.title))) return null

        const progress = game ? progressByGameId.get(game.id) : null

        return {
          id: trophyTitle.np_communication_id,
          title: trophyTitle.name,
          platform: trophyTitle.platform,
          category: game?.category ?? null,
          coverUrl: trophyTitle.icon_url ?? game?.cover_url ?? null,
          playCount: progress?.play_count ?? null,
          playDurationSeconds: progress?.play_duration_seconds ?? null,
          lastPlayedAt: progress?.last_played_at ?? null,
          lastUpdatedAt: trophyTitle.last_updated_at,
          hasTrophyGroups: Boolean(trophyTitle.has_trophy_groups),
          trophyProgress: trophyTitle.progress,
          earnedTrophies: trophyTitle.earned_trophies,
          definedTrophies: trophyTitle.defined_trophies,
        }
      })
      .filter((game): game is GameListItem => Boolean(game))

    return {
      games,
      summary: {
        totalGames: games.length,
        trophyTitles: trophyRows.length,
        totalPlaySeconds: games.reduce(
          (total, game) => total + (shouldCountSummaryPlayDuration(game) ? (game.playDurationSeconds ?? 0) : 0),
          0
        ),
        completedGames: games.filter((game) => game.trophyProgress === 100).length,
        lastSyncedAt: accountRows[0]?.last_synced_at ?? null,
        account: accountRows[0]
          ? {
              onlineId: accountRows[0].online_id,
              avatarUrl: accountRows[0].avatar_url,
              trophySummary: accountRows[0].trophy_summary,
            }
          : null,
      },
    }
  } catch {
    return emptyGamesData()
  }
}

export async function getMonthlyPlayedGames(monthValue: string): Promise<GameListItem[]> {
  if (!hasSupabaseEnv) return []

  try {
    const month = parseMonthValue(monthValue)
    if (!month) return []

    const range = getShanghaiMonthRange(month.year, month.monthIndex)
    const supabase = await getReadableClient()
    const { data: progressData, error: progressError } = await supabase
      .from('psn_game_progress')
      .select('game_id, play_count, play_duration_seconds, last_played_at')
      .gte('last_played_at', range.start.toISOString())
      .lt('last_played_at', range.end.toISOString())
      .order('last_played_at', { ascending: false, nullsFirst: false })

    if (progressError) return []

    const progressRows = (progressData ?? []) as ProgressRow[]
    const gameIds = Array.from(new Set(progressRows.map((progress) => progress.game_id)))
    if (gameIds.length === 0) return []

    const [
      { data: gamesData, error: gamesError },
      { data: trophyData, error: trophyError },
      { data: linkData, error: linkError },
    ] = await Promise.all([
      supabase
        .from('games')
        .select('id, title, localized_title, platform, category, cover_url, psn_concept_name')
        .in('id', gameIds),
      supabase
        .from('psn_trophy_titles')
        .select(
          'np_communication_id, game_id, name, platform, icon_url, has_trophy_groups, progress, earned_trophies, defined_trophies, last_updated_at'
        )
        .in('game_id', gameIds),
      supabase
        .from('psn_title_links')
        .select('np_communication_id, game_id, psn_title_id, match_method, match_confidence, verified')
        .in('game_id', gameIds),
    ])

    if (gamesError) return []

    const gameRows = (gamesData ?? []) as GameRow[]
    const trophyRows = trophyError ? [] : ((trophyData ?? []) as TrophyTitleRow[])
    const titleLinkRows = linkError ? [] : ((linkData ?? []) as TitleLinkRow[])
    const linkedCommunicationIds = Array.from(new Set(titleLinkRows.map((link) => link.np_communication_id)))
    const linkedTrophyRows =
      linkedCommunicationIds.length > 0
        ? await getTrophyRowsByCommunicationId(supabase, linkedCommunicationIds)
        : []

    const gameById = new Map(gameRows.map((game) => [game.id, game]))
    const trophiesByGameId = buildTrophiesByGameId(trophyRows, linkedTrophyRows, titleLinkRows)

    return progressRows
      .map((progress) => {
        const game = gameById.get(progress.game_id)
        if (!game) return null
        if (game.category && excludedCategories.has(game.category)) return null
        if (excludedTitles.has(normalizeTitle(game.title))) return null

        const trophyTitle = getBestTrophyTitle(trophiesByGameId.get(game.id) ?? [])
        if (!trophyTitle) return null

        return {
          id: game.id,
          title: trophyTitle.name,
          platform: trophyTitle.platform ?? formatGamePlatform(game),
          category: game.category,
          coverUrl: trophyTitle.icon_url ?? game.cover_url,
          playCount: progress.play_count,
          playDurationSeconds: progress.play_duration_seconds,
          lastPlayedAt: progress.last_played_at,
          lastUpdatedAt: trophyTitle.last_updated_at ?? progress.last_played_at,
          hasTrophyGroups: Boolean(trophyTitle.has_trophy_groups),
          trophyProgress: trophyTitle.progress,
          earnedTrophies: trophyTitle.earned_trophies,
          definedTrophies: trophyTitle.defined_trophies,
        }
      })
      .filter((game): game is GameListItem => Boolean(game))
  } catch {
    return []
  }
}

export async function getMonthlyPsnSnapshotActivity(monthValue: string): Promise<MonthlyPsnSnapshotActivity> {
  const month = parseMonthValue(monthValue)
  if (!month || !hasSupabaseEnv) return emptyMonthlyPsnSnapshotActivity(monthValue)

  const normalizedMonthValue = formatMonthValue(month.year, month.monthIndex)
  const startDate = formatSnapshotDate(month.year, month.monthIndex)
  const endDate = formatSnapshotDate(month.year, month.monthIndex + 1)

  try {
    const supabase = await getReadableClient()
    const { data: snapshotData, error: snapshotError } = await supabase
      .from('psn_monthly_snapshots')
      .select('id, snapshot_date, captured_at, online_id, total_play_seconds, total_earned_trophies')
      .in('snapshot_date', [startDate, endDate])
      .order('captured_at', { ascending: false })

    if (snapshotError) return emptyMonthlyPsnSnapshotActivity(normalizedMonthValue)

    const snapshotsByDate = new Map<string, MonthlySnapshotRow>()
    for (const snapshot of (snapshotData ?? []) as MonthlySnapshotRow[]) {
      if (!snapshotsByDate.has(snapshot.snapshot_date)) {
        snapshotsByDate.set(snapshot.snapshot_date, snapshot)
      }
    }

    const startSnapshot = snapshotsByDate.get(startDate) ?? null
    const endSnapshot = snapshotsByDate.get(endDate) ?? null

    if (!startSnapshot || !endSnapshot) {
      return {
        ...emptyMonthlyPsnSnapshotActivity(normalizedMonthValue),
        startSnapshot: startSnapshot ? toSnapshotSummary(startSnapshot) : null,
        endSnapshot: endSnapshot ? toSnapshotSummary(endSnapshot) : null,
      }
    }

    const { data: gameData, error: gameError } = await supabase
      .from('psn_monthly_snapshot_games')
      .select(
        'snapshot_id, game_id, np_communication_id, title, platform, category, cover_url, play_count, play_duration_seconds, last_played_at, trophy_progress, earned_trophies, defined_trophies, last_updated_at'
      )
      .in('snapshot_id', [startSnapshot.id, endSnapshot.id])

    if (gameError) {
      return {
        ...emptyMonthlyPsnSnapshotActivity(normalizedMonthValue),
        startSnapshot: toSnapshotSummary(startSnapshot),
        endSnapshot: toSnapshotSummary(endSnapshot),
      }
    }

    const rows = (gameData ?? []) as MonthlySnapshotGameRow[]
    const startRows = new Map(
      rows
        .filter((row) => row.snapshot_id === startSnapshot.id)
        .map((row) => [row.np_communication_id, row])
    )

    const games = rows
      .filter((row) => row.snapshot_id === endSnapshot.id)
      .map((endRow) => {
        if (endRow.category && excludedCategories.has(endRow.category)) return null
        if (excludedTitles.has(normalizeTitle(endRow.title))) return null

        const startRow = startRows.get(endRow.np_communication_id)
        const earnedTrophiesDelta = diffTrophyCounts(endRow.earned_trophies, startRow?.earned_trophies)
        const totalEarnedTrophiesDelta = countTrophies(earnedTrophiesDelta)
        const playDurationSecondsDelta = diffNumber(endRow.play_duration_seconds, startRow?.play_duration_seconds)
        const playCountDelta = diffNumber(endRow.play_count, startRow?.play_count)

        if (playDurationSecondsDelta === 0 && playCountDelta === 0 && totalEarnedTrophiesDelta === 0) {
          return null
        }

        return {
          id: endRow.np_communication_id,
          title: endRow.title,
          platform: endRow.platform,
          category: endRow.category,
          coverUrl: endRow.cover_url,
          playCountDelta,
          playDurationSecondsDelta,
          trophyProgress: endRow.trophy_progress,
          earnedTrophiesDelta,
          totalEarnedTrophiesDelta,
          platinumTrophiesDelta: earnedTrophiesDelta.platinum,
          lastPlayedAt: endRow.last_played_at,
          lastUpdatedAt: endRow.last_updated_at,
        }
      })
      .filter((game): game is MonthlyPsnGameDelta => Boolean(game))
      .sort((a, b) => {
        if (a.playDurationSecondsDelta !== b.playDurationSecondsDelta) {
          return b.playDurationSecondsDelta - a.playDurationSecondsDelta
        }
        if (a.totalEarnedTrophiesDelta !== b.totalEarnedTrophiesDelta) {
          return b.totalEarnedTrophiesDelta - a.totalEarnedTrophiesDelta
        }
        return Date.parse(b.lastPlayedAt ?? '') - Date.parse(a.lastPlayedAt ?? '')
      })

    const earnedTrophies = games.reduce<Required<TrophyCounts>>(
      (total, game) => addTrophyCounts(total, game.earnedTrophiesDelta),
      emptyTrophyCounts()
    )

    return {
      monthValue: normalizedMonthValue,
      startSnapshot: toSnapshotSummary(startSnapshot),
      endSnapshot: toSnapshotSummary(endSnapshot),
      games,
      totalPlaySeconds: games.reduce((total, game) => total + game.playDurationSecondsDelta, 0),
      earnedTrophies,
      totalEarnedTrophies: countTrophies(earnedTrophies),
      platinumTrophies: earnedTrophies.platinum,
    }
  } catch {
    return emptyMonthlyPsnSnapshotActivity(normalizedMonthValue)
  }
}

async function getTrophyRowsByCommunicationId(supabase: SupabaseClient, communicationIds: string[]) {
  const { data, error } = await supabase
    .from('psn_trophy_titles')
    .select(
      'np_communication_id, game_id, name, platform, icon_url, has_trophy_groups, progress, earned_trophies, defined_trophies, last_updated_at'
    )
    .in('np_communication_id', communicationIds)

  if (error) return []
  return (data ?? []) as TrophyTitleRow[]
}

function buildTrophiesByGameId(
  directRows: TrophyTitleRow[],
  linkedRows: TrophyTitleRow[],
  titleLinkRows: TitleLinkRow[]
) {
  const byGameId = new Map<string, TrophyTitleRow[]>()

  for (const row of directRows) {
    if (!row.game_id) continue
    byGameId.set(row.game_id, [...(byGameId.get(row.game_id) ?? []), row])
  }

  const linkByCommunicationId = new Map(titleLinkRows.map((link) => [link.np_communication_id, link]))
  for (const row of linkedRows) {
    const link = linkByCommunicationId.get(row.np_communication_id)
    if (!link) continue
    byGameId.set(link.game_id, [...(byGameId.get(link.game_id) ?? []), row])
  }

  return byGameId
}

function getBestTrophyTitle(rows: TrophyTitleRow[]) {
  return rows
    .slice()
    .sort((a, b) => {
      const aProgress = a.progress ?? -1
      const bProgress = b.progress ?? -1
      if (aProgress !== bProgress) return bProgress - aProgress
      return Date.parse(b.last_updated_at ?? '') - Date.parse(a.last_updated_at ?? '')
    })[0]
}

function formatGamePlatform(game: GameRow) {
  if (game.platform) return game.platform
  if (game.category === 'ps5_game') return 'PS5'
  if (game.category === 'ps4_game') return 'PS4'
  return null
}

function shouldCountSummaryPlayDuration(game: GameListItem) {
  return !excludedSummaryPlayDurationTitles.has(normalizeTitle(game.title))
}

async function getReadableClient(): Promise<SupabaseClient> {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createServiceRoleClient()
  }

  return createClient()
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

function findGameForTrophyTitle(
  trophyTitle: TrophyTitleRow,
  gameById: Map<string, GameRow>,
  gameByTitle: Map<string, GameRow[]>,
  progressByGameId: Map<string, ProgressRow>
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

function getTimeDistance(value: string | null | undefined, targetTime: number) {
  const time = Date.parse(value ?? '')
  if (!Number.isFinite(time) || !Number.isFinite(targetTime)) return Number.MAX_SAFE_INTEGER
  return Math.abs(time - targetTime)
}

function getShanghaiMonthRange(year: number, monthIndex: number) {
  return {
    start: fromShanghaiDate(year, monthIndex, 1),
    end: fromShanghaiDate(year, monthIndex + 1, 1),
  }
}

function parseMonthValue(value: string | null | undefined) {
  const match = /^(\d{4})-(\d{2})$/.exec(value ?? '')
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return null

  return {
    year,
    monthIndex: month - 1,
  }
}

function formatMonthValue(year: number, monthIndex: number) {
  const date = new Date(Date.UTC(year, monthIndex, 1))
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

function formatSnapshotDate(year: number, monthIndex: number) {
  const date = new Date(Date.UTC(year, monthIndex, 1))
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-01`
}

function fromShanghaiDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, day) - shanghaiOffsetMs)
}

function toSnapshotSummary(row: MonthlySnapshotRow): PsnSnapshotSummary {
  return {
    id: row.id,
    snapshotDate: row.snapshot_date,
    capturedAt: row.captured_at,
    onlineId: row.online_id,
    totalPlaySeconds: row.total_play_seconds ?? 0,
    totalEarnedTrophies: row.total_earned_trophies,
  }
}

function diffNumber(endValue: number | null | undefined, startValue: number | null | undefined) {
  return Math.max(0, (endValue ?? 0) - (startValue ?? 0))
}

function diffTrophyCounts(endCounts: TrophyCounts | null | undefined, startCounts: TrophyCounts | null | undefined) {
  return {
    bronze: diffNumber(endCounts?.bronze, startCounts?.bronze),
    silver: diffNumber(endCounts?.silver, startCounts?.silver),
    gold: diffNumber(endCounts?.gold, startCounts?.gold),
    platinum: diffNumber(endCounts?.platinum, startCounts?.platinum),
  }
}

function addTrophyCounts(first: Required<TrophyCounts>, second: Required<TrophyCounts>) {
  return {
    bronze: first.bronze + second.bronze,
    silver: first.silver + second.silver,
    gold: first.gold + second.gold,
    platinum: first.platinum + second.platinum,
  }
}

function countTrophies(counts: TrophyCounts | null | undefined) {
  if (!counts) return 0
  return (counts.bronze ?? 0) + (counts.silver ?? 0) + (counts.gold ?? 0) + (counts.platinum ?? 0)
}

function emptyTrophyCounts(): Required<TrophyCounts> {
  return {
    bronze: 0,
    silver: 0,
    gold: 0,
    platinum: 0,
  }
}

function normalizeTitle(value: string) {
  const normalized = value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[™®©]/g, '')
    .replace(/[’‘]/g, "'")
    .replace(/[:：\-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return normalized
    .replace(/\biv\b/g, '4')
    .replace(/\biii\b/g, '3')
    .replace(/\bii\b/g, '2')
    .replace(/\bv\b/g, '5')
}

function emptyGamesData(): GamesData {
  return {
    games: [],
    summary: {
      totalGames: 0,
      trophyTitles: 0,
      totalPlaySeconds: 0,
      completedGames: 0,
      lastSyncedAt: null,
      account: null,
    },
  }
}

function emptyMonthlyPsnSnapshotActivity(monthValue: string): MonthlyPsnSnapshotActivity {
  return {
    monthValue,
    startSnapshot: null,
    endSnapshot: null,
    games: [],
    totalPlaySeconds: 0,
    earnedTrophies: emptyTrophyCounts(),
    totalEarnedTrophies: 0,
    platinumTrophies: 0,
  }
}
