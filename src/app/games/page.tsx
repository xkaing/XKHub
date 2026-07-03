import { AppShell } from '@/components/app-shell'
import { GamesTable } from '@/components/games/games-table'
import { PsnAccountOverview } from '@/components/games/psn-account-overview'
import { PsnSnapshotButton } from '@/components/games/psn-snapshot-button'
import { PsnSyncButton } from '@/components/games/psn-sync-button'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getGamesData } from '@/lib/data/games.server'

export default async function GamesPage() {
  const { games, summary } = await getGamesData()

  return (
    <AppShell>
      <PageHeader
        eyebrow="Games / PSN"
        badge="Synced"
        title="游戏与 PSN 奖杯"
        description="从 PSN 同步的游戏列表、游玩时长和奖杯完成度。购买记录稍后可以手动补充。"
      />

      <PsnAccountOverview summary={summary} />

      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <CardTitle>游戏列表</CardTitle>
              <span className="text-sm text-muted-foreground">{formatSyncedAt(summary.lastSyncedAt)}</span>
            </div>
            <div className="flex flex-wrap items-start gap-2 md:justify-end">
              <PsnSyncButton />
              <PsnSnapshotButton lastSyncedAt={summary.lastSyncedAt} />
            </div>
          </div>
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

function formatSyncedAt(value: string | null) {
  if (!value) return '暂无同步时间'

  const formatted = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

  return `本次数据同步于 ${formatted}`
}
