import Image from 'next/image'
import Link from 'next/link'
import { PackageSearch, ReceiptText, type LucideIcon } from 'lucide-react'
import { Suspense } from 'react'

import { AppShell } from '@/components/app-shell'
import { MetricCard } from '@/components/metric-card'
import { MonthSelector } from '@/components/monthly/month-selector'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getModelItems } from '@/lib/data/models.server'
import {
  formatCurrency,
  formatCurrencyTotals,
  formatMonthDate,
  getCurrentMonthValue,
  getMonthlyActivity,
  normalizeMonthValue,
} from '@/lib/data/monthly'

type MonthlySearchParams = {
  month?: string | string[]
}

type MonthlyPageProps = {
  searchParams?: Promise<MonthlySearchParams>
}

export default async function MonthlyPage({ searchParams }: MonthlyPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const selectedMonth = normalizeMonthValue(resolvedSearchParams?.month)
  const modelItems = await getModelItems()
  const activity = getMonthlyActivity(modelItems, [], selectedMonth)

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
  ]

  return (
    <AppShell>
      <PageHeader
        eyebrow="Monthly Activity"
        badge="本月动态"
        title="本月动态"
        description="记录所选月份买了多少个模型，以及对应花费。"
      />

      <div className="flex justify-end">
        <Suspense fallback={<div className="h-16 w-full max-w-sm rounded-lg border bg-card" />}>
          <MonthSelector value={activity.monthValue} currentMonth={getCurrentMonthValue()} />
        </Suspense>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <section>
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
      </section>
    </AppShell>
  )
}

function EmptyState({
  icon: Icon,
  label,
  href,
  action,
}: {
  icon: LucideIcon
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
