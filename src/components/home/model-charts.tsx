'use client'

import { Bar, BarChart, Cell, Label, LabelList, Pie, PieChart, XAxis, YAxis } from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ModelItem } from '@/types'

type MonthlyChartData = {
  month: string
  count: number
  amount: number
}

type PieChartData = {
  name: string
  label: string
  value: number
  fill: string
}

const monthlyChartConfig = {
  count: {
    label: '购买数量',
    color: 'var(--chart-1)',
  },
  amount: {
    label: '实付金额',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

const seriesChartConfig = {
  value: {
    label: '模型数量',
  },
  'Warhammer 40,000': {
    label: 'Warhammer 40,000',
    color: 'var(--chart-3)',
  },
  'The Horus Heresy': {
    label: 'The Horus Heresy',
    color: 'var(--chart-4)',
  },
  'Space Marine 2': {
    label: 'Space Marine 2',
    color: 'var(--chart-1)',
  },
  'Secret Level': {
    label: 'Secret Level',
    color: 'var(--chart-2)',
  },
  未分类: {
    label: '未分类',
    color: 'var(--chart-5)',
  },
} satisfies ChartConfig

const priceRangeChartConfig = {
  value: {
    label: '实付金额',
  },
  '1-200': {
    label: '1-200',
    color: 'var(--chart-3)',
  },
  '200-400': {
    label: '200-400',
    color: 'var(--chart-4)',
  },
  '400+': {
    label: '400以上',
    color: 'var(--chart-5)',
  },
} satisfies ChartConfig

const chartColors = ['var(--chart-3)', 'var(--chart-4)', 'var(--chart-1)', 'var(--chart-2)', 'var(--chart-5)']

export function HomeModelCharts({ items }: { items: ModelItem[] }) {
  const monthlyData = getMonthlyChartData(items)
  const seriesData = getSeriesPieData(items)
  const priceRangeData = getPriceRangePieData(items)
  const totalModels = seriesData.reduce((sum, item) => sum + item.value, 0)
  const totalAmount = priceRangeData.reduce((sum, item) => sum + item.value, 0)

  return (
    <section className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">月度模型趋势</CardTitle>
          <CardDescription className="text-base">按购买月份统计模型数量和实付金额。</CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyData.length > 0 ? (
            <ChartContainer config={monthlyChartConfig} className="h-[340px] w-full">
              <BarChart accessibilityLayer data={monthlyData} margin={{ top: 28, right: 18, left: 18, bottom: 8 }}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={16} className="text-sm" />
                <YAxis yAxisId="count" hide />
                <YAxis yAxisId="amount" orientation="right" hide />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => {
                        const label = name === 'amount' ? '实付金额' : '购买数量'
                        const displayValue =
                          name === 'amount' && typeof value === 'number'
                            ? formatCurrency(value)
                            : `${value} 个`

                        return (
                          <>
                            <span className="text-muted-foreground">{label}</span>
                            <span className="ml-auto font-mono font-medium tabular-nums">{displayValue}</span>
                          </>
                        )
                      }}
                    />
                  }
                />
                <Bar yAxisId="count" dataKey="count" fill="var(--color-count)" radius={0}>
                  <LabelList dataKey="count" position="top" className="fill-foreground" fontSize={13} />
                </Bar>
                <Bar yAxisId="amount" dataKey="amount" fill="var(--color-amount)" radius={0}>
                  <LabelList
                    dataKey="amount"
                    position="top"
                    className="fill-foreground"
                    fontSize={13}
                    formatter={(value) => formatCompactCurrency(Number(value ?? 0))}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <ChartEmptyState label="暂无月度模型数据" />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <DistributionPieChart
          title="系列分布"
          description="按模型系列统计收藏占比。"
          data={seriesData}
          config={seriesChartConfig}
          emptyLabel="暂无系列数据"
          centerValue={totalModels.toLocaleString('zh-CN')}
          centerLabel="模型总数"
          valueFormatter={(value) => `${value.toLocaleString('zh-CN')} 个`}
        />
        <DistributionPieChart
          title="价格区间"
          description="按实付金额区间汇总金额占比。"
          data={priceRangeData}
          config={priceRangeChartConfig}
          emptyLabel="暂无价格数据"
          centerValue={formatCompactCurrency(totalAmount)}
          centerLabel="总金额"
          valueFormatter={formatCurrency}
        />
      </div>
    </section>
  )
}

function DistributionPieChart({
  title,
  description,
  data,
  config,
  emptyLabel,
  centerValue,
  centerLabel,
  valueFormatter,
}: {
  title: string
  description: string
  data: PieChartData[]
  config: ChartConfig
  emptyLabel: string
  centerValue: string
  centerLabel: string
  valueFormatter: (value: number) => string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={config} className="mx-auto h-[320px] w-full">
            <PieChart accessibilityLayer>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    nameKey="name"
                    hideLabel
                    formatter={(value, name) => (
                      <>
                        <span className="text-muted-foreground">{name}</span>
                        <span className="ml-auto font-mono font-medium tabular-nums">
                          {valueFormatter(Number(value ?? 0))}
                        </span>
                      </>
                    )}
                  />
                }
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={76}
                outerRadius={112}
                strokeWidth={5}
              >
                {data.map((item) => (
                  <Cell key={item.name} fill={item.fill} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                            {centerValue}
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 24} className="fill-muted-foreground text-sm">
                            {centerLabel}
                          </tspan>
                        </text>
                      )
                    }

                    return null
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        ) : (
          <ChartEmptyState label={emptyLabel} />
        )}
      </CardContent>
    </Card>
  )
}

function ChartEmptyState({ label }: { label: string }) {
  return <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">{label}</div>
}

function getMonthlyChartData(items: ModelItem[]): MonthlyChartData[] {
  const counts = new Map<string, MonthlyChartData>()

  for (const item of items) {
    if (!item.purchaseDate) continue
    const date = new Date(item.purchaseDate)
    if (Number.isNaN(date.getTime())) continue

    const month = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`
    const entry = counts.get(month) ?? { month, count: 0, amount: 0 }
    entry.count += 1
    entry.amount += item.purchasePrice ?? 0
    counts.set(month, entry)
  }

  return Array.from(counts.values()).sort((first, second) => first.month.localeCompare(second.month))
}

function getSeriesPieData(items: ModelItem[]): PieChartData[] {
  const counts = new Map<string, number>()

  for (const item of items) {
    const series = item.series?.trim() || '未分类'
    counts.set(series, (counts.get(series) ?? 0) + 1)
  }

  return toPieData(counts, formatSeriesLabel)
}

function getPriceRangePieData(items: ModelItem[]): PieChartData[] {
  const counts = new Map<string, number>([
    ['1-200', 0],
    ['200-400', 0],
    ['400+', 0],
  ])

  for (const item of items) {
    const price = item.purchasePrice
    if (price === null || price <= 0) continue

    if (price < 200) counts.set('1-200', (counts.get('1-200') ?? 0) + price)
    else if (price < 400) counts.set('200-400', (counts.get('200-400') ?? 0) + price)
    else counts.set('400+', (counts.get('400+') ?? 0) + price)
  }

  return toPieData(counts, (value) => value).filter((item) => item.value > 0)
}

function toPieData(counts: Map<string, number>, formatLabel: (value: string) => string): PieChartData[] {
  return Array.from(counts, ([name, value], index) => ({
    name,
    label: formatLabel(name),
    value,
    fill: chartColors[index % chartColors.length],
  }))
    .filter((item) => item.value > 0)
    .sort((first, second) => second.value - first.value)
}

function formatSeriesLabel(series: string) {
  if (series === 'Warhammer 40,000') return '40K'
  if (series === 'The Horus Heresy') return 'Heresy'
  if (series === 'Space Marine 2') return 'SM2'
  if (series === 'Secret Level') return 'Secret'
  return series.length > 10 ? `${series.slice(0, 10)}...` : series
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatCompactCurrency(value: number) {
  if (value >= 10000) return `¥${(value / 10000).toFixed(1)}万`
  if (value >= 1000) return `¥${(value / 1000).toFixed(1)}k`
  return `¥${Math.round(value)}`
}
