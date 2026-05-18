import { Bot, FileSearch, WandSparkles } from 'lucide-react'

import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const tools = [
  {
    title: '自然语言查数据',
    description: '例如：今年模型花了多少钱？哪些游戏还没白金？',
    icon: FileSearch,
  },
  {
    title: '自动整理订单',
    description: '粘贴订单文本或商品信息，AI 提取价格、时间、标签和状态。',
    icon: WandSparkles,
  },
  {
    title: '生成报告页面',
    description: '从 Supabase 数据生成年度总结、收藏展示页或 H5 文案。',
    icon: Bot,
  },
]

export default function AIPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="AI Workspace"
        badge="Planned"
        title="AI 数据工作台"
        description="这里预留给 OpenAI/Vercel AI SDK。AI 应该通过 Next 服务端工具访问 Supabase，而不是在浏览器里直连敏感能力。"
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <Card key={tool.title}>
              <CardHeader>
                <Icon className="size-5 text-primary" />
                <CardTitle>{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>查询入口草稿</CardTitle>
          <CardDescription>下一步接入 AI SDK 后，这里会变成流式对话界面。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="question">问题</Label>
          <div className="flex gap-2">
            <Input id="question" placeholder="今年模型和游戏一共花了多少钱？" disabled />
            <Button disabled>发送</Button>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  )
}
