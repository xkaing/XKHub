import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const schemaDraft = [
  {
    table: 'games',
    fields: 'title, platform, publisher, release_date, cover_url, status',
    note: '游戏本体档案',
  },
  {
    table: 'game_purchases',
    fields: 'game_id, purchase_date, purchase_price, currency, store, order_no',
    note: '购买历史和金额',
  },
  {
    table: 'psn_trophies',
    fields: 'game_id, platinum, completion_rate, earned_count, total_count, last_sync_at',
    note: '奖杯进度快照',
  },
]

export default function GamesPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Games / PSN"
        badge="Schema draft"
        title="游戏与 PSN 奖杯"
        description="这里会承载你购买和游玩游戏的历史，包括平台、价格、游玩状态、白金记录和奖杯完成率。"
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {schemaDraft.map((item) => (
          <Card key={item.table}>
            <CardHeader>
              <CardTitle>{item.table}</CardTitle>
              <CardDescription>{item.note}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md bg-muted p-3 font-mono text-xs leading-6 text-muted-foreground">
                {item.fields}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>建议录入顺序</CardTitle>
          <CardDescription>先保证核心数据能进库，再做奖杯自动化和统计。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {['游戏基础档案', '购买记录', 'PSN 奖杯快照'].map((step, index) => (
            <div key={step} className="rounded-lg border p-4">
              <Badge variant="secondary">Step {index + 1}</Badge>
              <div className="mt-3 font-medium">{step}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  )
}
