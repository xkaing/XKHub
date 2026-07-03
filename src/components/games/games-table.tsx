'use client'

import { useMemo, useState, type ReactNode } from 'react'
import Image from 'next/image'
import { ArrowDown, ArrowUp, ChevronsUpDown, ChevronLeft, ChevronRight, Trophy } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { GameListItem } from '@/lib/data/games.server'

const pageSizeOptions = [20, 40, 80, 120, 'all'] as const
type SortField = 'recent' | 'playtime'
type SortDirection = 'asc' | 'desc'
type SortState = {
  field: SortField
  direction: SortDirection
}

export function GamesTable({ games }: { games: GameListItem[] }) {
  const [pageSize, setPageSize] = useState<number | 'all'>('all')
  const [page, setPage] = useState(1)
  const [sortState, setSortState] = useState<SortState>({ field: 'recent', direction: 'desc' })
  const sortedGames = useMemo(() => sortGames(games, sortState), [games, sortState])
  const effectivePageSize = pageSize === 'all' ? Math.max(games.length, 1) : pageSize
  const totalPages = Math.max(1, Math.ceil(sortedGames.length / effectivePageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * effectivePageSize
  const end = Math.min(start + effectivePageSize, sortedGames.length)
  const pageGames = useMemo(() => sortedGames.slice(start, end), [sortedGames, start, end])

  function changePageSize(value: string) {
    setPageSize(value === 'all' ? 'all' : Number(value))
    setPage(1)
  }

  function toggleSort(field: SortField) {
    setSortState((current) => ({
      field,
      direction: current.field === field && current.direction === 'desc' ? 'asc' : 'desc',
    }))
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[44%]">游戏</TableHead>
            <TableHead>
              <SortableHeader
                active={sortState.field === 'playtime'}
                direction={sortState.direction}
                onClick={() => toggleSort('playtime')}
              >
                时长
              </SortableHeader>
            </TableHead>
            <TableHead>奖杯</TableHead>
            <TableHead>
              <SortableHeader
                active={sortState.field === 'recent'}
                direction={sortState.direction}
                onClick={() => toggleSort('recent')}
              >
                最近更新
              </SortableHeader>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageGames.map((game) => (
            <TableRow key={game.id}>
              <TableCell>
                <div className="flex min-w-72 items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-muted">
                    {game.coverUrl ? (
                      <Image src={game.coverUrl} alt="" fill sizes="56px" className="object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-medium">{game.title}</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {game.platform ? <Badge variant="secondary">{game.platform}</Badge> : null}
                      {game.hasTrophyGroups ? <Badge variant="outline">DLC</Badge> : null}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{formatPlaySeconds(game.playDurationSeconds)}</div>
                <div className="text-xs text-muted-foreground">{formatPlayCount(game.playCount)}</div>
              </TableCell>
              <TableCell>
                <TrophyProgressCell game={game} />
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDate(game.lastUpdatedAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div className="flex flex-wrap items-center justify-end gap-3 text-sm text-muted-foreground">
          <span>
            显示 {sortedGames.length === 0 ? 0 : start + 1}-{end} / {sortedGames.length}
          </span>
          <label className="flex items-center gap-2">
            每页
            <select
              value={pageSize}
              onChange={(event) => changePageSize(event.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground shadow-sm"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? '全部' : option}
                </option>
              ))}
            </select>
            条
          </label>
          <span>第 {currentPage} / {totalPages} 页</span>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            上一页
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            disabled={currentPage >= totalPages}
          >
            下一页
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function SortableHeader({
  active,
  direction,
  onClick,
  children,
}: {
  active: boolean
  direction: SortDirection
  onClick: () => void
  children: ReactNode
}) {
  const Icon = active ? (direction === 'desc' ? ArrowDown : ArrowUp) : ChevronsUpDown

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase transition-colors hover:text-foreground"
      aria-sort={active ? (direction === 'desc' ? 'descending' : 'ascending') : 'none'}
    >
      {children}
      <Icon className="size-3.5" aria-hidden="true" />
    </button>
  )
}

function sortGames(games: GameListItem[], sortState: SortState) {
  return games.slice().sort((a, b) => {
    if (sortState.field === 'playtime') {
      return comparePlaySeconds(a, b, sortState.direction)
    }

    return compareRecent(a, b, sortState.direction)
  })
}

function comparePlaySeconds(a: GameListItem, b: GameListItem, direction: 'asc' | 'desc') {
  const result = comparePlaySecondsValue(a, b, direction)
  return result || compareRecentValue(a, b, 'desc') || compareTitle(a, b)
}

function compareRecent(a: GameListItem, b: GameListItem, direction: SortDirection) {
  const result = compareRecentValue(a, b, direction)
  return result || comparePlaySecondsValue(a, b, 'desc') || compareTitle(a, b)
}

function comparePlaySecondsValue(a: GameListItem, b: GameListItem, direction: SortDirection) {
  const aPlaySeconds = a.playDurationSeconds
  const bPlaySeconds = b.playDurationSeconds

  if (aPlaySeconds === null && bPlaySeconds === null) return 0
  if (aPlaySeconds === null) return 1
  if (bPlaySeconds === null) return -1

  return direction === 'desc' ? bPlaySeconds - aPlaySeconds : aPlaySeconds - bPlaySeconds
}

function compareRecentValue(a: GameListItem, b: GameListItem, direction: SortDirection) {
  const aTime = Date.parse(a.lastUpdatedAt ?? '')
  const bTime = Date.parse(b.lastUpdatedAt ?? '')

  if (!Number.isFinite(aTime) && !Number.isFinite(bTime)) return 0
  if (!Number.isFinite(aTime)) return 1
  if (!Number.isFinite(bTime)) return -1

  return direction === 'desc' ? bTime - aTime : aTime - bTime
}

function compareTitle(a: GameListItem, b: GameListItem) {
  return a.title.localeCompare(b.title, 'zh-CN')
}

function TrophyProgressCell({ game }: { game: GameListItem }) {
  const progress = clampProgress(game.trophyProgress)
  const progressWidth = progress ?? 0

  return (
    <div
      className="relative min-h-12 min-w-40 overflow-hidden rounded-md border bg-muted/25 px-3 py-2"
      role="progressbar"
      aria-label="奖杯进度"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress ?? undefined}
      title={progress === null ? '无奖杯进度' : `${progress}%`}
    >
      <div
        className="absolute inset-y-0 left-0 bg-primary/20"
        style={{ width: `${progressWidth}%` }}
        aria-hidden="true"
      />
      <div className="relative flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold tabular-nums">{formatProgress(progress)}</div>
          <div className="mt-0.5 truncate text-xs text-muted-foreground">{formatTrophyCounts(game)}</div>
        </div>
        {hasPlatinumTrophy(game) ? (
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-sky-400/30 bg-background/70 text-sky-200 shadow-sm"
            aria-label="已获得白金奖杯"
            title="已获得白金奖杯"
          >
            <Trophy className="h-4 w-4" aria-hidden="true" />
          </span>
        ) : null}
      </div>
    </div>
  )
}

export function formatPlaySeconds(seconds: number | null) {
  if (!seconds) return '0h'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours >= 100) return `${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

function formatPlayCount(count: number | null) {
  if (!count) return '未记录启动次数'
  return `${count} 次启动`
}

function formatProgress(progress: number | null) {
  if (progress === null) return '-'
  return `${progress}%`
}

function formatTrophyCounts(game: GameListItem) {
  const earned = countTrophies(game.earnedTrophies)
  const total = countTrophies(game.definedTrophies)

  if (!total) return '无奖杯数据'
  return `${earned}/${total} 已获得`
}

function hasPlatinumTrophy(game: GameListItem) {
  return (game.earnedTrophies?.platinum ?? 0) > 0
}

function clampProgress(progress: number | null) {
  if (progress === null) return null
  return Math.min(100, Math.max(0, progress))
}

function countTrophies(counts: GameListItem['earnedTrophies']) {
  if (!counts) return 0
  return (counts.bronze ?? 0) + (counts.silver ?? 0) + (counts.gold ?? 0) + (counts.platinum ?? 0)
}

function formatDate(value: string | null) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}
