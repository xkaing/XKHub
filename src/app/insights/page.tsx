import { AppShell } from '@/components/app-shell'
import { MetricCard } from '@/components/metric-card'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getModelMetrics } from '@/lib/data/models'
import { getModelItems } from '@/lib/data/models.server'

export default async function InsightsPage() {
  const items = await getModelItems()
  const metrics = getModelMetrics(items)
  const byUniverse = items.reduce<Record<string, number>>((acc, item) => {
    const key = item.universe ?? '未分类'
    acc[key] = (acc[key] ?? 0) + (item.purchasePrice ?? 0)
    return acc
  }, {})

  return (
    <AppShell>
      <PageHeader
        eyebrow="Insights"
        badge="Derived"
        title="金额统计与数据洞察"
        description="统计页从模型、游戏、奖杯和订单数据派生。当前展示 Supabase 模型数据聚合，后续可以接入图表和年度报告。"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>按宇宙聚合</CardTitle>
          <CardDescription>这是未来 ECharts/Recharts 图表的数据雏形。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(byUniverse).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between rounded-lg border p-4">
              <span className="font-medium">{label}</span>
              <span className="text-muted-foreground">¥{value.toLocaleString('zh-CN')}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  )
}
