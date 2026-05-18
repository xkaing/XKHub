import type { Metric } from '@/types'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function MetricCard({ metric }: { metric: Metric }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{metric.value}</div>
        <p className="mt-1 text-sm text-muted-foreground">{metric.detail}</p>
      </CardContent>
    </Card>
  )
}
