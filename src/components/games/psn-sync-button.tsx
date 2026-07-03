'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExternalLink, KeyRound, RefreshCw, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type TokenStatus = {
  configured: boolean
  hasAccessToken: boolean
  hasRefreshToken: boolean
  accessToken: TokenTimeStatus | null
  refreshToken: TokenTimeStatus | null
  updatedAt: string | null
  error?: string
}

type TokenTimeStatus = {
  expiresAt: string | null
  isExpired: boolean
  secondsRemaining: number
}

export function PsnSyncButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isLoadingStatus, setIsLoadingStatus] = useState(false)
  const [npsso, setNpsso] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [status, setStatus] = useState<TokenStatus | null>(null)

  useEffect(() => {
    if (!open) return
    void loadStatus()
  }, [open])

  async function loadStatus() {
    setIsLoadingStatus(true)

    try {
      const response = await fetch('/api/psn/auth/status', { cache: 'no-store' })
      const payload = (await response.json()) as TokenStatus
      setStatus(payload)
    } catch {
      setStatus({
        configured: false,
        hasAccessToken: false,
        hasRefreshToken: false,
        accessToken: null,
        refreshToken: null,
        updatedAt: null,
        error: '读取令牌状态失败',
      })
    } finally {
      setIsLoadingStatus(false)
    }
  }

  async function handleSync() {
    setIsSyncing(true)
    setMessage(null)

    try {
      const response = await fetch('/api/psn/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          npsso: npsso.trim() || undefined,
        }),
      })
      const payload = (await response.json()) as { message?: string; error?: string }

      if (!response.ok) {
        setMessage(payload.error ?? '同步失败')
        return
      }

      setMessage(payload.message ?? '同步完成')
      setNpsso('')
      await loadStatus()
      router.refresh()
    } catch {
      setMessage('同步请求失败')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">
          <RefreshCw className="mr-2 size-4" />
          同步
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>PSN 同步</DialogTitle>
          <DialogDescription>
            首次同步可粘贴 NPSSO 初始化刷新令牌；之后可以直接使用已保存的刷新令牌同步。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <TokenCard
              label="Access Token"
              hasToken={status?.hasAccessToken ?? false}
              token={status?.accessToken ?? null}
              loading={isLoadingStatus}
            />
            <TokenCard
              label="Refresh Token"
              hasToken={status?.hasRefreshToken ?? false}
              token={status?.refreshToken ?? null}
              loading={isLoadingStatus}
            />
          </div>

          {status?.updatedAt ? (
            <p className="text-xs text-muted-foreground">令牌最后更新：{formatDateTime(status.updatedAt)}</p>
          ) : null}
          {status?.configured === false ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              服务器缺少 Supabase URL 或 service role key，暂时不能读取或保存令牌。
            </p>
          ) : null}

          <div className="rounded-md border bg-muted/20 p-4">
            <div className="text-sm font-medium">获取 NPSSO</div>
            <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                1. 打开 PlayStation 官网并登录你的 PSN 账号。
              </li>
              <li>
                2. 登录成功后，在同一个浏览器打开 Sony SSO Cookie 页面。
              </li>
              <li>
                3. 页面会返回类似 <code className="rounded bg-muted px-1 py-0.5">{'{"npsso":"..." }'}</code> 的 JSON，复制其中的
                <code className="mx-1 rounded bg-muted px-1 py-0.5">npsso</code>
                值并粘贴到下面。
              </li>
            </ol>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild type="button" variant="outline" size="sm">
                <a href="https://www.playstation.com/zh-hant-hk/" target="_blank" rel="noreferrer">
                  登录 PlayStation
                  <ExternalLink className="ml-2 h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </Button>
              <Button asChild type="button" variant="outline" size="sm">
                <a href="https://ca.account.sony.com/api/v1/ssocookie" target="_blank" rel="noreferrer">
                  打开 SSO Cookie
                  <ExternalLink className="ml-2 h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="psn-npsso">
              NPSSO
            </label>
            <Input
              id="psn-npsso"
              type="password"
              value={npsso}
              onChange={(event) => setNpsso(event.target.value)}
              placeholder="首次初始化或刷新令牌失效时粘贴"
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              NPSSO 只会发送到服务端用于换取 PSN token，不会保存到数据库。
            </p>
          </div>

          {message ? <p className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">{message}</p> : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={loadStatus} disabled={isLoadingStatus || isSyncing}>
            刷新状态
          </Button>
          <Button type="button" onClick={handleSync} disabled={isSyncing || status?.configured === false}>
            <RefreshCw className={cn('mr-2 h-4 w-4', isSyncing ? 'animate-spin' : null)} />
            {isSyncing ? '同步中' : formatSyncButtonLabel(npsso)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function TokenCard({
  label,
  hasToken,
  token,
  loading,
}: {
  label: string
  hasToken: boolean
  token: TokenTimeStatus | null
  loading: boolean
}) {
  const isUsable = hasToken && token && !token.isExpired

  return (
    <div className="rounded-md border bg-muted/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium">{label}</div>
        {isUsable ? (
          <ShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden="true" />
        ) : (
          <KeyRound className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        )}
      </div>
      <div className="mt-3 text-lg font-semibold">{loading ? '检查中' : formatTokenState(hasToken, token)}</div>
      <div className="mt-1 text-xs text-muted-foreground">{formatTokenExpiry(token)}</div>
    </div>
  )
}

function formatTokenState(hasToken: boolean, token: TokenTimeStatus | null) {
  if (!hasToken) return '未保存'
  if (!token?.expiresAt) return '已保存'
  return token.isExpired ? '已过期' : '可用'
}

function formatTokenExpiry(token: TokenTimeStatus | null) {
  if (!token?.expiresAt) return '暂无过期时间'
  return `过期时间：${formatDateTime(token.expiresAt)}`
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatSyncButtonLabel(npsso: string) {
  return npsso.trim() ? '保存令牌并同步' : '使用保存令牌同步'
}
