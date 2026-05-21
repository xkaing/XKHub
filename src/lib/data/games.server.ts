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
    const linkByCommunicationId = new Map(titleLinkRows.map((link) => [link.np_communication_id, link]))

    const games = trophyRows
      .map((trophyTitle) => {
        const titleLink = linkByCommunicationId.get(trophyTitle.np_communication_id)
        const game = titleLink
          ? gameById.get(titleLink.game_id) ?? null
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
  if (trophyTitle.game_id) {
    const game = gameById.get(trophyTitle.game_id)
    if (game) return game
  }

  const candidates = gameByTitle.get(normalizeTitle(trophyTitle.name)) ?? []
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

function fromShanghaiDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, day) - shanghaiOffsetMs)
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
