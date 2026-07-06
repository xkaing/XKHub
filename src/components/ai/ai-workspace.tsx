'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import {
  Cat,
  Coins,
  Copy,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Square,
} from 'lucide-react'

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import { Message, MessageActions, MessageAction, MessageContent, MessageResponse } from '@/components/ai-elements/message'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { suancaiProfile } from '@/lib/ai/suancai-profile'

type WorkspaceMode = 'assistant' | 'data' | 'report'
type ThinkingMode = 'disabled' | 'enabled' | 'adaptive'
type BalanceInfo = {
  currency: string
  total_balance: string
  granted_balance: string
  topped_up_balance: string
}
type BalanceState =
  | { status: 'loading'; data?: undefined; error?: undefined }
  | { status: 'ready'; data: { is_available: boolean; balance_infos: BalanceInfo[] }; error?: undefined }
  | { status: 'error'; data?: undefined; error: string }

const currentConfig = {
  model: suancaiProfile.model,
  modelLabel: suancaiProfile.modelLabel,
  workspaceMode: 'assistant' satisfies WorkspaceMode,
  workspaceModeLabel: suancaiProfile.role,
  workspaceModeDescription: suancaiProfile.tagline,
  thinking: suancaiProfile.thinking satisfies ThinkingMode,
  thinkingLabel: suancaiProfile.thinkingLabel,
} as const

const starterPrompts = [
  '帮我把这个想法拆成一份可以执行的计划。',
  '帮我整理一下今天这件事的关键问题和下一步。',
  '我想做一个网页版本的个人 agent，第一阶段应该怎么落地？',
  '帮我把一个模糊需求梳理成页面、数据和接口的任务列表。',
]

function getStatusLabel(status: ReturnType<typeof useChat>['status']) {
  if (status === 'submitted') return '等待响应'
  if (status === 'streaming') return '流式输出中'
  if (status === 'error') return '请求异常'
  return '就绪'
}

function getTextFromMessage(message: ReturnType<typeof useChat>['messages'][number]) {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('')
}

async function fetchChat(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init)
  if (response.ok) return response

  let message = `请求失败：${response.status}`
  try {
    const body = (await response.clone().json()) as { error?: unknown }
    if (typeof body.error === 'string') message = body.error
  } catch {
    const text = await response.clone().text()
    if (text) message = text
  }

  throw new Error(message)
}

export function AIWorkspace() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [balanceState, setBalanceState] = useState<BalanceState>({ status: 'loading' })
  const configRef = useRef({
    model: currentConfig.model,
    thinking: currentConfig.thinking,
    workspaceMode: currentConfig.workspaceMode,
  })

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        prepareSendMessagesRequest: ({ id, messages, body, trigger, messageId }) => {
          return {
            body: {
              ...body,
              id,
              messages,
              trigger,
              messageId,
              ...configRef.current,
            },
          }
        },
        fetch: fetchChat,
      }),
    []
  )

  const { messages, sendMessage, status, stop, regenerate, error } = useChat({
    transport,
    experimental_throttle: 60,
  })

  const isBusy = status === 'submitted' || status === 'streaming'

  const loadBalance = useCallback(async () => {
    setBalanceState({ status: 'loading' })

    try {
      const response = await fetch('/api/ai/balance', { cache: 'no-store' })
      const body = (await response.json()) as { error?: unknown; is_available?: boolean; balance_infos?: BalanceInfo[] }

      if (!response.ok) {
        throw new Error(typeof body.error === 'string' ? body.error : `余额查询失败：${response.status}`)
      }

      setBalanceState({
        status: 'ready',
        data: {
          is_available: Boolean(body.is_available),
          balance_infos: Array.isArray(body.balance_infos) ? body.balance_infos : [],
        },
      })
    } catch (balanceError) {
      setBalanceState({
        status: 'error',
        error: balanceError instanceof Error ? balanceError.message : '余额查询失败',
      })
    }
  }, [])

  useEffect(() => {
    loadBalance()
  }, [loadBalance])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const text = String(formData.get('message') ?? '').trim()
    if (!text || isBusy) return
    await sendMessage({ text })
    form.reset()
    if (textareaRef.current) textareaRef.current.value = ''
  }

  const sendStarter = (text: string) => {
    if (isBusy) return
    sendMessage({ text })
  }

  return (
    <div className="grid min-h-0 flex-1 gap-4 overflow-hidden xl:grid-cols-[minmax(0,1fr)_18rem]">
      <section className="flex min-h-0 flex-col overflow-hidden border bg-card shadow-sm">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 items-center justify-center border bg-background">
              <Cat className="size-5 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold tracking-normal">{suancaiProfile.name}</h2>
                <Badge variant="secondary">{getStatusLabel(status)}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{suancaiProfile.tagline}</p>
            </div>
          </div>
          {isBusy ? (
            <Button variant="outline" size="sm" onClick={stop}>
              <Square className="size-3.5" />
              停止
            </Button>
          ) : null}
        </div>

        <Conversation className="min-h-0 flex-1">
          <ConversationContent className="min-h-full p-5">
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<Sparkles className="size-10" />}
                title="开始对话"
                description="先从整理想法、拆解任务和推进项目开始。"
              >
                <div className="mx-auto flex max-w-3xl flex-col items-center gap-4">
                  <div className="flex size-12 items-center justify-center border bg-background">
                    <Sparkles className="size-7 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold tracking-normal">把想法放进来</h3>
                    <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                      先从对话和规划开始。长期记忆、会话管理和工具调用会在后续阶段逐步接入。
                    </p>
                  </div>
                  <div className="grid w-full gap-2 md:grid-cols-2">
                    {starterPrompts.map((prompt) => (
                      <Button
                        key={prompt}
                        variant="outline"
                        className="h-auto min-w-0 justify-start whitespace-normal break-words px-4 py-3 text-left leading-5 normal-case tracking-normal"
                        onClick={() => sendStarter(prompt)}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              </ConversationEmptyState>
            ) : (
              messages.map((message, messageIndex) => (
                <Message key={message.id} from={message.role}>
                  <MessageContent>
                    {message.parts.map((part, partIndex) => {
                      const key = `${message.id}-${partIndex}`
                      if (part.type === 'text') {
                        return <MessageResponse key={key}>{part.text}</MessageResponse>
                      }
                      if (part.type === 'reasoning') {
                        return (
                          <div key={key} className="border-l-2 border-primary/40 pl-3 text-xs text-muted-foreground">
                            <MessageResponse>{part.text}</MessageResponse>
                          </div>
                        )
                      }
                      return null
                    })}
                  </MessageContent>
                  {message.role === 'assistant' && messageIndex === messages.length - 1 ? (
                    <MessageActions className="pl-0">
                      <MessageAction tooltip="重新生成" onClick={() => regenerate()}>
                        <RotateCcw className="size-3.5" />
                      </MessageAction>
                      <MessageAction
                        tooltip="复制"
                        onClick={() => navigator.clipboard.writeText(getTextFromMessage(message))}
                      >
                        <Copy className="size-3.5" />
                      </MessageAction>
                    </MessageActions>
                  ) : null}
                </Message>
              ))
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {error ? (
          <div className="border-t bg-destructive/5 px-5 py-3 text-sm text-destructive">
            {error.message || '请求失败。请检查 `DEEPSEEK_API_KEY`、模型名和服务端日志后重试。'}
          </div>
        ) : null}

        <form className="relative shrink-0 border-t bg-background/30 p-4" onSubmit={handleSubmit}>
          <Textarea
            name="message"
            ref={textareaRef}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault()
                event.currentTarget.form?.requestSubmit()
              }
            }}
            placeholder="说点什么，或者让我帮你把想法拆成下一步..."
            className="max-h-40 min-h-20 resize-none border-0 bg-transparent px-0 pt-2 pr-14 pb-10 text-sm leading-6 shadow-none focus-visible:ring-0"
          />
          {isBusy ? (
            <Button className="absolute right-4 bottom-4" type="button" size="icon-sm" onClick={stop} aria-label="停止生成">
              <Square className="size-4" />
            </Button>
          ) : (
            <Button className="absolute right-4 bottom-4" type="submit" size="icon-sm" aria-label="发送消息">
              <Sparkles className="size-4" />
            </Button>
          )}
        </form>
      </section>

      <aside className="grid min-h-0 content-start gap-4 overflow-y-auto">
        <Card size="sm">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <Coins className="size-5 text-primary" />
                <CardTitle>余额</CardTitle>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={loadBalance}
                disabled={balanceState.status === 'loading'}
                aria-label="刷新 DeepSeek 余额"
              >
                <RefreshCw className={balanceState.status === 'loading' ? 'size-3 animate-spin' : 'size-3'} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <BalanceStatus state={balanceState} />
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>当前助手</CardTitle>
            <CardDescription>{suancaiProfile.role}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
            <ConfigRow label="模型" value={currentConfig.modelLabel} />
            <ConfigRow label="风格" value={suancaiProfile.traits.join(' / ')} />
            <ConfigRow label="思考模式" value={currentConfig.thinkingLabel} />
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <Cat className="size-5 text-primary" />
            <CardTitle>身份设定</CardTitle>
            <CardDescription>{currentConfig.workspaceModeDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>定位是个人助手，不绑定某个具体数据模块。</p>
            <p>XKHub 只是当前所在的网页空间，后续数据、记忆和工具都会作为能力接入。</p>
          </CardContent>
        </Card>

      </aside>
    </div>
  )
}

function BalanceStatus({ state }: { state: BalanceState }) {
  if (state.status === 'loading') {
    return <p className="text-muted-foreground">正在查询余额...</p>
  }

  if (state.status === 'error') {
    return <p className="text-destructive">{state.error}</p>
  }

  if (state.data.balance_infos.length === 0) {
    return <p className="text-muted-foreground">没有返回余额明细。</p>
  }

  const primaryBalance = state.data.balance_infos[0]

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">DEEPSEEK</span>
      <div className="whitespace-nowrap text-right text-base font-semibold">
        {primaryBalance.total_balance} <span className="text-muted-foreground">{primaryBalance.currency}</span>
      </div>
    </div>
  )
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b pb-2 last:border-b-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}
