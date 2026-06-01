import Link from 'next/link'
import { ArrowRight, Bot, ChartNoAxesCombined, Database, Sparkles } from 'lucide-react'

import { AppShell } from '@/components/app-shell'
import { HomeModelCharts } from '@/components/home/model-charts'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getModelItems } from '@/lib/data/models.server'
import { dataModules } from '@/lib/data/modules'

export default async function Home() {
  const items = await getModelItems()

  return (
    <AppShell>
      <PageHeader
        eyebrow="XKHub / Personal Data OS"
        badge="Supabase only"
        title="整理游戏、模型、奖杯和消费历史的个人数据后台"
        description="先把数据长期沉淀到 Supabase，再从同一套数据里生成统计看板、AI 查询、年度报告和 H5 展示页。"
      />

      <HomeModelCharts items={items} />

      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader>
            <CardTitle>数据模块</CardTitle>
            <CardDescription>项目按“可录入、可统计、可生成页面”的长期结构重建。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {dataModules.map((module) => (
              <Link
                key={module.title}
                href={module.href}
                className="group rounded-lg border p-4 transition-colors hover:bg-accent"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-medium">{module.title}</h2>
                  <Badge variant={module.status === 'ready' ? 'default' : 'secondary'}>{module.status}</Badge>
                </div>
                <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{module.description}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{module.records}</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>下一阶段架构</CardTitle>
            <CardDescription>为了后面做 AI 和 H5，先把边界搭稳。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Database className="mt-1 size-5 text-primary" />
              <div>
                <div className="font-medium">Supabase 作为唯一事实源</div>
                <p className="mt-1 text-sm text-muted-foreground">模型、游戏和购买记录全部进入数据库，本地不再保留 mock 数据源。</p>
              </div>
            </div>
            <div className="flex gap-3">
              <ChartNoAxesCombined className="mt-1 size-5 text-primary" />
              <div>
                <div className="font-medium">统计从数据模型派生</div>
                <p className="mt-1 text-sm text-muted-foreground">金额、平台、IP、状态和年度报告都不写死在页面里。</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Bot className="mt-1 size-5 text-primary" />
              <div>
                <div className="font-medium">AI 通过服务端工具读数据</div>
                <p className="mt-1 text-sm text-muted-foreground">避免在浏览器暴露 key，也方便之后做自然语言查询。</p>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link href="/models">
                <Sparkles className="mr-2 size-4" />
                管理模型数据
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  )
}
