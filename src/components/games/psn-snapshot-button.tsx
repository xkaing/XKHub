'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Archive, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function PsnSnapshotButton({ lastSyncedAt }: { lastSyncedAt: string | null }) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSaveSnapshot() {
    setIsSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/psn/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saveMonthlySnapshot: true }),
      })
      const payload = (await response.json()) as { message?: string; error?: string }

      if (!response.ok) {
        setMessage(payload.error ?? '记录快照失败')
        return
      }

      setMessage(payload.message ?? '快照已记录')
      router.refresh()
    } catch {
      setMessage('记录快照请求失败')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <Button type="button" variant="secondary" onClick={handleSaveSnapshot} disabled={isSaving}>
        {isSaving ? (
          <RefreshCw className={cn('mr-2 size-4', isSaving ? 'animate-spin' : null)} />
        ) : (
          <Archive className="mr-2 size-4" />
        )}
        {isSaving ? '记录中' : `记录快照（${formatLastSyncedDate(lastSyncedAt)}）`}
      </Button>
      {message ? <p className="max-w-72 text-xs text-muted-foreground">{message}</p> : null}
    </div>
  )
}

function formatLastSyncedDate(value: string | null) {
  if (!value) return '暂无同步'

  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}
