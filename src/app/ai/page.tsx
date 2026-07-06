import { AIWorkspace } from '@/components/ai/ai-workspace'
import { AppShell } from '@/components/app-shell'
import { Badge } from '@/components/ui/badge'

export default function AIPage() {
  return (
    <AppShell>
      <div className="flex h-[calc(100dvh-8rem)] min-h-0 flex-col gap-4">
        <div className="flex shrink-0 flex-wrap items-end justify-between gap-3 border-b pb-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-sm font-medium text-muted-foreground">Personal Agent</div>
              <Badge variant="secondary">Streaming</Badge>
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-normal text-foreground md:text-3xl">个人助手</h1>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            从对话、规划和项目协作开始，后续逐步接入记忆、会话和工具。
          </p>
        </div>
        <AIWorkspace />
      </div>
    </AppShell>
  )
}
