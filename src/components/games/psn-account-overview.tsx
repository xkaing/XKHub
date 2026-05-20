import Image from 'next/image'
import { Trophy } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { GameListSummary, TrophySummary } from '@/lib/data/games.server'

export function PsnAccountOverview({ summary }: { summary: GameListSummary }) {
  const account = summary.account
  const trophies = account?.trophySummary?.earnedTrophies ?? {}

  return (
    <Card>
      <CardContent className="grid items-stretch gap-6 p-6 lg:grid-cols-[minmax(230px,1.15fr)_minmax(300px,1.35fr)_minmax(320px,1.5fr)]">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
            {account?.avatarUrl ? (
              <Image src={account.avatarUrl} alt="" fill sizes="80px" className="object-cover" />
            ) : null}
          </div>
          <div className="min-w-0">
            <div className="truncate text-xl font-semibold">{account?.onlineId ?? 'PSN Account'}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="secondary">Lv. {formatLevel(account?.trophySummary)}</Badge>
              <Badge variant="outline">{formatLevelProgress(account?.trophySummary)}</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <Stat label="总时长" value={formatPlaySeconds(summary.totalPlaySeconds)} />
          <Stat label="总游戏" value={String(summary.totalGames)} />
          <Stat label="100%" value={String(summary.completedGames)} highlight />
        </div>

        <div className="grid grid-cols-4 gap-3 text-sm">
          <TrophyStat label="白金" value={trophies.platinum} tone="platinum" />
          <TrophyStat label="黄金" value={trophies.gold} tone="gold" />
          <TrophyStat label="白银" value={trophies.silver} tone="silver" />
          <TrophyStat label="黄铜" value={trophies.bronze} tone="bronze" />
        </div>
      </CardContent>
    </Card>
  )
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`flex min-h-24 min-w-0 flex-col justify-center rounded-md border px-3 py-4 ${
        highlight ? 'bg-primary/20' : 'bg-muted/20'
      }`}
    >
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-2 whitespace-nowrap text-2xl font-semibold leading-none tracking-normal">{value}</div>
    </div>
  )
}

function TrophyStat({ label, value, tone }: { label: string; value?: number; tone: string }) {
  const toneClass: Record<string, string> = {
    platinum: 'bg-sky-500/10 text-sky-300',
    gold: 'bg-amber-500/10 text-amber-300',
    silver: 'bg-zinc-400/10 text-zinc-300',
    bronze: 'bg-orange-700/10 text-orange-300',
  }
  const toneTitle: Record<string, string> = {
    platinum: '白金奖杯',
    gold: '黄金奖杯',
    silver: '白银奖杯',
    bronze: '黄铜奖杯',
  }
  const toneValueClass: Record<string, string> = {
    platinum: 'text-sky-300',
    gold: 'text-amber-300',
    silver: 'text-zinc-300',
    bronze: 'text-orange-300',
  }
  const classes = toneClass[tone]

  return (
    <div
      className="flex min-h-24 flex-col items-center justify-center gap-3 rounded-md border bg-muted/20 p-4"
      aria-label={`${toneTitle[tone] ?? label} ${value ?? 0}`}
      title={toneTitle[tone] ?? label}
    >
      <span className={`flex h-8 w-8 items-center justify-center rounded-md ${classes}`}>
        <Trophy className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className={`text-2xl font-semibold leading-none ${toneValueClass[tone]}`}>
        {value ?? 0}
      </div>
    </div>
  )
}

function formatLevel(summary: TrophySummary | null | undefined) {
  return summary?.trophyLevel ?? '-'
}

function formatLevelProgress(summary: TrophySummary | null | undefined) {
  if (summary?.progress === undefined) return '进度 -'
  return `进度 ${summary.progress}%`
}

function formatPlaySeconds(seconds: number | null) {
  if (!seconds) return '0h'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours >= 100) return `${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}
