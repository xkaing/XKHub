import { AppShell } from '@/components/app-shell'
import { GamesTable } from '@/components/games/games-table'
import { PsnSyncButton } from '@/components/games/psn-sync-button'
import { MetricCard } from '@/components/metric-card'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getGamesData } from '@/lib/data/games.server'
import type { Metric } from '@/types'

export default async function GamesPage() {
  const { games, summary } = await getGamesData()
  const metrics: Metric[] = [
    {
      label: '游戏数量',
      value: String(summary.totalGames),
      detail: '来自 PSN 游玩记录',
    },
    {
      label: '奖杯标题',
      value: String(summary.trophyTitles),
      detail: '已同步的奖杯组',
    },
    {
      label: '累计游玩',
      value: formatPlaySeconds(summary.totalPlaySeconds),
      detail: 'PSN 返回的总时长',
    },
  ]

  return (
    <AppShell>
      <PageHeader
        eyebrow="Games / PSN"
        badge="Synced"
        title="游戏与 PSN 奖杯"
        description="从 PSN 同步的游戏列表、游玩时长和奖杯完成度。购买记录稍后可以手动补充。"
      />

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <div>
            <CardTitle>游戏列表</CardTitle>
            <CardDescription className="mt-1">
              按最近游玩时间排序。{formatSyncedAt(summary.lastSyncedAt)}
            </CardDescription>
          </div>
          <PsnSyncButton />
        </CardHeader>
        <CardContent>
          {games.length > 0 ? <GamesTable games={games} /> : <EmptyState />}
        </CardContent>
      </Card>
    </AppShell>
  )
}

function EmptyState() {
  return (
    <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
      还没有读到 PSN 游戏数据。
    </div>
  )
}

function formatPlaySeconds(seconds: number | null) {
  if (!seconds) return '0h'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours >= 100) return `${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

function formatSyncedAt(value: string | null) {
  if (!value) return '暂无同步时间。'

  const formatted = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

  return `本次数据同步于 ${formatted}。`
}
