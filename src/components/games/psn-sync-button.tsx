'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function PsnSyncButton() {
  const router = useRouter()
  const [isSyncing, setIsSyncing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSync() {
    setIsSyncing(true)
    setMessage(null)

    try {
      const response = await fetch('/api/psn/sync', { method: 'POST' })
      const payload = (await response.json()) as { message?: string; error?: string }

      if (!response.ok) {
        setMessage(payload.error ?? '同步失败')
        return
      }

      setMessage(payload.message ?? '同步完成')
      router.refresh()
    } catch {
      setMessage('同步请求失败')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" size="sm" onClick={handleSync} disabled={isSyncing}>
        <RefreshCw className={cn('mr-2 h-4 w-4', isSyncing ? 'animate-spin' : null)} />
        {isSyncing ? '同步中' : '同步'}
      </Button>
      {message ? <p className="max-w-80 text-right text-xs text-muted-foreground">{message}</p> : null}
    </div>
  )
}
