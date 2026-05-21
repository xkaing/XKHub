import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, Gamepad2, PackageSearch, ReceiptText, Trophy } from 'lucide-react'

import { AppShell } from '@/components/app-shell'
import { MetricCard } from '@/components/metric-card'
import { MonthSelector } from '@/components/monthly/month-selector'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getGamesData, getMonthlyPlayedGames } from '@/lib/data/games.server'
import { getModelItems } from '@/lib/data/models.server'
import {
  formatCurrency,
  formatCurrencyTotals,
  formatMonthDate,
  getCurrentMonthValue,
  getMonthlyActivity,
  normalizeMonthValue,
} from '@/lib/data/monthly'

type MonthlyGame = Awaited<ReturnType<typeof getGamesData>>['games'][number]

type MonthlyPageProps = {
  searchParams?: {
    month?: string | string[]
  }
}

export default async function MonthlyPage({ searchParams }: MonthlyPageProps) {
  const selectedMonth = normalizeMonthValue(searchParams?.month)
  const [modelItems, playedGames] = await Promise.all([getModelItems(), getMonthlyPlayedGames(selectedMonth)])
  const activity = getMonthlyActivity(modelItems, playedGames, selectedMonth)

  const metrics = [
    {
      label: '当月模型',
      value: `${activity.modelCount}`,
      detail: '按购买日期统计',
    },
    {
      label: '当月花费',
      value: formatCurrencyTotals(activity.totalPaidByCurrency),
      detail: '按购买价汇总',
    },
    {
      label: 'PSN 游戏',
      value: `${activity.playedGames.length}`,
      detail: '当月有游玩记录',
    },
    {
      label: '统计区间',
      value: activity.monthLabel,
      detail: activity.rangeLabel,
    },
  ]

  return (
    <AppShell>
      <PageHeader
        eyebrow="Monthly Activity"
        badge="本月动态"
        title="本月动态"
        description="记录所选月份买了多少个模型、花了多少钱，以及游玩过哪些 PSN 游戏。"
      />

      <div className="flex justify-end">
        <MonthSelector value={activity.monthValue} currentMonth={getCurrentMonthValue()} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PackageSearch className="size-5 text-primary" />
                模型购买
              </CardTitle>
              <CardDescription className="mt-1">{activity.monthLabel}新增模型和对应实付金额。</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/models">管理模型</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {activity.modelItems.length > 0 ? (
              <div className="space-y-3">
                {activity.modelItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} width={56} height={56} className="h-14 w-14 object-cover" />
                      ) : (
                        <ReceiptText className="size-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{item.name}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{item.brand}</span>
                        <span>{formatMonthDate(item.purchaseDate)}</span>
                        {item.purchasePlatform ? <span>{item.purchasePlatform}</span> : null}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-semibold">
                        {formatCurrency(item.purchasePrice ?? 0, item.currency)}
                      </div>
                      <Badge variant={item.status === 'owned' ? 'default' : 'secondary'} className="mt-1">
                        {formatModelStatus(item.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={PackageSearch}
                label={`${activity.monthLabel}还没有模型购买记录。`}
                href="/models"
                action="去录入模型"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="size-5 text-primary" />
                PSN 游玩
              </CardTitle>
              <CardDescription className="mt-1">
                按 PSN 最近游玩时间筛选{activity.monthLabel}有奖杯数据的游玩记录。
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/games">查看游戏</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {activity.playedGames.length > 0 ? (
              <div className="space-y-3">
                {activity.playedGames.map((game) => (
                  <MonthlyGameRow key={game.id} game={game} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CalendarDays}
                label={`${activity.monthLabel}还没有 PSN 游玩记录。`}
                href="/games"
                action="同步 PSN"
              />
            )}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  )
}

function MonthlyGameRow({ game }: { game: MonthlyGame }) {
  const progress = clampProgress(game.trophyProgress)
  const progressWidth = progress ?? 0

  return (
    <div
      className="relative flex items-center gap-3 overflow-hidden rounded-lg border bg-muted/25 p-3"
      role="progressbar"
      aria-label={`${game.title} 奖杯进度`}
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
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
        {game.coverUrl ? (
          <Image src={game.coverUrl} alt="" width={56} height={56} className="h-14 w-14 object-cover" />
        ) : (
          <Gamepad2 className="size-5 text-muted-foreground" />
        )}
      </div>
      <div className="relative min-w-0 flex-1">
        <div className="truncate font-medium">{game.title}</div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">{game.platform}</Badge>
          <span>上次游玩 {formatMonthDate(game.lastPlayedAt)}</span>
        </div>
      </div>
      <div className="relative w-28 shrink-0 text-right sm:w-32">
        <div className="flex items-center justify-end gap-1.5 font-semibold tabular-nums">
          {hasPlatinumTrophy(game) ? (
            <Trophy className="size-4 text-sky-200" aria-label="已获得白金奖杯" />
          ) : null}
          <span>{formatProgress(progress)}</span>
        </div>
        <div className="mt-1 truncate text-xs text-muted-foreground">{formatTrophyCounts(game)}</div>
      </div>
    </div>
  )
}

function EmptyState({
  icon: Icon,
  label,
  href,
  action,
}: {
  icon: typeof CalendarDays
  label: string
  href: string
  action: string
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
      <Icon className="size-8 text-muted-foreground" />
      <p className="mt-3 text-sm text-muted-foreground">{label}</p>
      <Button asChild variant="outline" size="sm" className="mt-4">
        <Link href={href}>{action}</Link>
      </Button>
    </div>
  )
}

function formatModelStatus(status: string) {
  if (status === 'preorder') return '预订'
  if (status === 'gifted') return '赠送'
  return '已入库'
}

function formatProgress(progress: number | null) {
  if (progress === null) return '-'
  return `${progress}%`
}

function formatTrophyCounts(game: MonthlyGame) {
  const earned = countTrophies(game.earnedTrophies)
  const total = countTrophies(game.definedTrophies)

  if (!total) return '无奖杯数据'
  return `${earned}/${total} 已获得`
}

function clampProgress(progress: number | null) {
  if (progress === null) return null
  return Math.min(100, Math.max(0, progress))
}

function countTrophies(counts: MonthlyGame['earnedTrophies']) {
  if (!counts) return 0
  return (counts.bronze ?? 0) + (counts.silver ?? 0) + (counts.gold ?? 0) + (counts.platinum ?? 0)
}

function hasPlatinumTrophy(game: MonthlyGame) {
  return (game.earnedTrophies?.platinum ?? 0) > 0
}
