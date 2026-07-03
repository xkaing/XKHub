import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function GamesLoading() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Games / PSN"
        badge="Synced"
        title="游戏与 PSN 奖杯"
        description="从 PSN 同步的游戏列表、游玩时长和奖杯完成度。购买记录稍后可以手动补充。"
      />

      <PsnOverviewSkeleton />

      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <CardTitle>游戏列表</CardTitle>
              <Skeleton className="h-4 w-44" />
            </div>
            <div className="flex flex-wrap items-start gap-2 md:justify-end">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <GamesTableSkeleton />
        </CardContent>
      </Card>
    </AppShell>
  )
}

function PsnOverviewSkeleton() {
  return (
    <Card aria-label="PSN 概览加载中">
      <CardContent className="grid items-stretch gap-6 p-6 lg:grid-cols-[minmax(230px,1.15fr)_minmax(300px,1.35fr)_minmax(320px,1.5fr)]">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-6 w-40" />
            <div className="mt-3 flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
        </div>

        <div className="grid grid-cols-4 gap-3">
          <TrophySkeleton />
          <TrophySkeleton />
          <TrophySkeleton />
          <TrophySkeleton />
        </div>
      </CardContent>
    </Card>
  )
}

function StatSkeleton() {
  return (
    <div className="flex min-h-24 min-w-0 flex-col justify-center rounded-md border bg-muted/20 px-3 py-4">
      <Skeleton className="h-3 w-12" />
      <Skeleton className="mt-3 h-7 w-16" />
    </div>
  )
}

function TrophySkeleton() {
  return (
    <div className="flex min-h-24 flex-col items-center justify-center gap-3 rounded-md border bg-muted/20 p-4">
      <Skeleton className="h-8 w-8" />
      <Skeleton className="h-7 w-10" />
    </div>
  )
}

function GamesTableSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-label="游戏列表加载中">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[44%]">游戏</TableHead>
            <TableHead>时长</TableHead>
            <TableHead>奖杯</TableHead>
            <TableHead>最近更新</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 8 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="flex min-w-72 items-center gap-3">
                  <Skeleton className="h-14 w-14 shrink-0 rounded-md" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-44" />
                    <div className="flex gap-1">
                      <Skeleton className="h-5 w-10" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-14" />
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-2 w-28" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-end gap-3">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}
