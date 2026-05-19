'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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

export function GamesTable({ games }: { games: GameListItem[] }) {
  const [pageSize, setPageSize] = useState<number | 'all'>(20)
  const [page, setPage] = useState(1)
  const effectivePageSize = pageSize === 'all' ? Math.max(games.length, 1) : pageSize
  const totalPages = Math.max(1, Math.ceil(games.length / effectivePageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * effectivePageSize
  const end = Math.min(start + effectivePageSize, games.length)
  const pageGames = useMemo(() => games.slice(start, end), [games, start, end])

  function changePageSize(value: string) {
    setPageSize(value === 'all' ? 'all' : Number(value))
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          显示 {games.length === 0 ? 0 : start + 1}-{end} / {games.length}
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
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
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[44%]">游戏</TableHead>
            <TableHead>平台</TableHead>
            <TableHead>时长</TableHead>
            <TableHead>奖杯</TableHead>
            <TableHead>最近游玩</TableHead>
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
                      {game.category ? <Badge variant="secondary">{formatCategory(game.category)}</Badge> : null}
                      {game.service ? <Badge variant="outline">{formatService(game.service)}</Badge> : null}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{game.platform ?? '-'}</TableCell>
              <TableCell>
                <div className="font-medium">{formatPlaySeconds(game.playDurationSeconds)}</div>
                <div className="text-xs text-muted-foreground">{formatPlayCount(game.playCount)}</div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{formatProgress(game.trophyProgress)}</div>
                <div className="text-xs text-muted-foreground">{formatTrophyCounts(game)}</div>
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDate(game.lastPlayedAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          第 {currentPage} / {totalPages} 页
        </div>
        <div className="flex items-center gap-2">
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

function countTrophies(counts: GameListItem['earnedTrophies']) {
  if (!counts) return 0
  return (counts.bronze ?? 0) + (counts.silver ?? 0) + (counts.gold ?? 0) + (counts.platinum ?? 0)
}

function formatDate(value: string | null) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}

function formatCategory(value: string) {
  const categoryMap: Record<string, string> = {
    ps4_game: 'PS4',
    ps5_native_game: 'PS5',
    pspc_game: 'PC',
    unknown: 'Unknown',
  }

  return categoryMap[value] ?? value
}

function formatService(value: string) {
  const serviceMap: Record<string, string> = {
    none: '直接拥有',
    none_purchased: '已购买',
    ps_plus: 'PS Plus',
  }

  return serviceMap[value] ?? value
}
