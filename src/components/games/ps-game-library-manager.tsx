'use client'

import { useEffect, useMemo, useState } from 'react'
import type React from 'react'
import {
  CalendarDays,
  Edit,
  Gamepad2,
  Heart,
  ImagePlus,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Trash2,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { CurrencyCode, PsGameItem, PsGameStatus } from '@/types'

type PsGameRow = {
  id: string
  game_id: string | null
  title: string | null
  cover_url: string | null
  release_date: string | null
  developer: string | null
  publisher: string | null
  platform: string | null
  status: string | null
  purchase_date: string | null
  purchase_price: number | string | null
  currency: CurrencyCode | null
  store: string | null
  order_no: string | null
  edition: string | null
  format: string | null
  note: string | null
  created_at: string
  updated_at: string
}

type FormState = {
  title: string
  coverUrl: string
  releaseDate: string
  developer: string
  publisher: string
  status: PsGameStatus
  purchaseDate: string
  purchasePrice: string
  currency: CurrencyCode
  store: string
  format: string
  note: string
}

type StatusFilter = 'all' | PsGameStatus
type ProtectedAction =
  | { type: 'create' }
  | { type: 'edit'; item: PsGameItem }
  | { type: 'delete'; item: PsGameItem }

const psGameAccessKey = 'XKAI'
const psGameAccessSessionKey = 'xkhub:ps-game-access-key'

const emptyForm: FormState = {
  title: '',
  coverUrl: '',
  releaseDate: '',
  developer: '',
  publisher: '',
  status: 'wishlist',
  purchaseDate: '',
  purchasePrice: '',
  currency: 'CNY',
  store: 'PlayStation Store',
  format: '数字版',
  note: '',
}

const statusText: Record<PsGameStatus, string> = {
  owned: '已购买',
  wishlist: '想买',
}

const storeOptions = ['PlayStation Store', '淘宝', '京东', '拼多多', '闲鱼', '线下店']
const formatOptions = ['数字版', '实体版', 'DLC', '季票', '豪华版', '典藏版']
const currencyOptions: CurrencyCode[] = ['CNY', 'USD', 'JPY']
const queryTimeoutMs = 10000
const queryTimeoutError = 'PS_GAME_QUERY_TIMEOUT'

function toText(value: string | null | undefined) {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeStatus(value: string | null | undefined): PsGameStatus {
  return value === 'wishlist' ? 'wishlist' : 'owned'
}

function fromRow(row: PsGameRow): PsGameItem {
  return {
    id: row.id,
    gameId: row.game_id,
    title: row.title ?? '未命名游戏',
    coverUrl: row.cover_url,
    releaseDate: row.release_date,
    developer: row.developer,
    publisher: row.publisher,
    platform: row.platform,
    status: normalizeStatus(row.status),
    purchaseDate: row.purchase_date,
    purchasePrice: toNumber(row.purchase_price),
    currency: row.currency ?? 'CNY',
    store: row.store,
    orderNo: row.order_no,
    edition: row.edition,
    format: row.format,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function formFromItem(item: PsGameItem): FormState {
  return {
    title: item.title,
    coverUrl: item.coverUrl ?? '',
    releaseDate: item.releaseDate ?? '',
    developer: item.developer ?? '',
    publisher: item.publisher ?? '',
    status: item.status,
    purchaseDate: item.purchaseDate ?? '',
    purchasePrice: item.purchasePrice?.toString() ?? '',
    currency: item.currency,
    store: item.store ?? '',
    format: item.format ?? '',
    note: item.note ?? '',
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return fallback
}

export function PsGameLibraryManager() {
  const [items, setItems] = useState<PsGameItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [query, setQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [accessDialogOpen, setAccessDialogOpen] = useState(false)
  const [accessInput, setAccessInput] = useState('')
  const [accessError, setAccessError] = useState<string | null>(null)
  const [pendingProtectedAction, setPendingProtectedAction] = useState<ProtectedAction | null>(null)
  const [editingItem, setEditingItem] = useState<PsGameItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<PsGameItem | null>(null)
  const [previewItem, setPreviewItem] = useState<PsGameItem | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  const metrics = useMemo(() => {
    const owned = items.filter((item) => item.status === 'owned')
    const wishlist = items.filter((item) => item.status === 'wishlist')
    const totalPaid = owned.reduce((total, item) => total + (item.purchasePrice ?? 0), 0)
    const upcoming = items.filter((item) => {
      if (!item.releaseDate) return false
      return Date.parse(item.releaseDate) > Date.now()
    })

    return [
      { label: '总记录', value: items.length.toString(), detail: '已买和想买合计', icon: Gamepad2 },
      { label: '已购买', value: owned.length.toString(), detail: formatCurrency(totalPaid, 'CNY'), icon: ShoppingBag },
      { label: '想买', value: wishlist.length.toString(), detail: '候选购买池', icon: Heart },
      { label: '未发售', value: upcoming.length.toString(), detail: '按发售日期判断', icon: CalendarDays },
    ]
  }, [items])

  const filteredItems = useMemo(() => {
    const keyword = query.trim().toLowerCase()

    return items.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      if (!matchesStatus) return false
      if (!keyword) return true

      return [item.title, item.developer, item.publisher, item.platform, item.store]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(keyword))
    })
  }, [items, query, statusFilter])

  const sortedItems = useMemo(
    () =>
      filteredItems.slice().sort((first, second) => {
        const firstDate = Date.parse(first.releaseDate ?? first.purchaseDate ?? '')
        const secondDate = Date.parse(second.releaseDate ?? second.purchaseDate ?? '')
        const firstMissing = Number.isNaN(firstDate)
        const secondMissing = Number.isNaN(secondDate)

        if (firstMissing && secondMissing) return first.title.localeCompare(second.title, 'zh-CN')
        if (firstMissing) return 1
        if (secondMissing) return -1
        return secondDate - firstDate
      }),
    [filteredItems]
  )

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const fetchItems = async () => {
    setLoading(true)
    setError(null)
    let timeoutId: number | undefined

    try {
      const controller = new AbortController()
      const supabase = createClient()
      const query = supabase
        .from('game_purchases')
        .select('*')
        .order('release_date', { ascending: false, nullsFirst: false })
        .order('purchase_date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .abortSignal(controller.signal)
      const timeout = new Promise<never>((_, reject) => {
        timeoutId = window.setTimeout(() => {
          controller.abort()
          reject(new Error(queryTimeoutError))
        }, queryTimeoutMs)
      })
      const { data, error: queryError } = await Promise.race([
        query,
        timeout,
      ])

      if (queryError) throw queryError
      setItems(((data ?? []) as PsGameRow[]).map(fromRow))
    } catch (err) {
      const message =
        err instanceof Error && err.message === queryTimeoutError
          ? '读取 PS 游戏清单超时，请检查 Supabase 连接或表权限'
          : getErrorMessage(err, '读取 PS 游戏清单失败')
      setError(message)
    } finally {
      if (timeoutId) window.clearTimeout(timeoutId)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const openCreateDialog = () => {
    setEditingItem(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEditDialog = (item: PsGameItem) => {
    setEditingItem(item)
    setForm(formFromItem(item))
    setDialogOpen(true)
  }

  const openDeleteDialog = (item: PsGameItem) => {
    setDeletingItem(item)
    setDeleteDialogOpen(true)
  }

  const hasPsGameAccess = () => {
    try {
      return sessionStorage.getItem(psGameAccessSessionKey) === psGameAccessKey
    } catch {
      return false
    }
  }

  const runProtectedAction = (action: ProtectedAction) => {
    if (hasPsGameAccess()) {
      if (action.type === 'create') openCreateDialog()
      if (action.type === 'edit') openEditDialog(action.item)
      if (action.type === 'delete') openDeleteDialog(action.item)
      return
    }

    setPendingProtectedAction(action)
    setAccessInput('')
    setAccessError(null)
    setAccessDialogOpen(true)
  }

  const submitAccessKey = () => {
    if (accessInput.trim() !== psGameAccessKey) {
      setAccessError('密钥不正确')
      return
    }

    try {
      sessionStorage.setItem(psGameAccessSessionKey, psGameAccessKey)
    } catch {
      // sessionStorage 不可用时仍允许本次已验证操作继续。
    }

    const action = pendingProtectedAction
    setAccessDialogOpen(false)
    setPendingProtectedAction(null)
    setAccessInput('')
    setAccessError(null)

    if (action?.type === 'create') openCreateDialog()
    if (action?.type === 'edit') openEditDialog(action.item)
    if (action?.type === 'delete') openDeleteDialog(action.item)
  }

  const handleAccessDialogOpenChange = (open: boolean) => {
    setAccessDialogOpen(open)
    if (!open) {
      setPendingProtectedAction(null)
      setAccessInput('')
      setAccessError(null)
    }
  }

  const saveItem = async () => {
    if (!form.title.trim()) {
      setError('请输入游戏名称')
      return
    }

    setSaving(true)
    setError(null)

    const payload = {
      title: form.title.trim(),
      cover_url: toText(form.coverUrl),
      release_date: toText(form.releaseDate),
      developer: toText(form.developer),
      publisher: toText(form.publisher),
      status: form.status,
      purchase_date: form.status === 'owned' ? toText(form.purchaseDate) : null,
      purchase_price: form.status === 'owned' ? toNumber(form.purchasePrice) : null,
      currency: form.currency,
      store: form.status === 'owned' ? toText(form.store) : null,
      format: toText(form.format),
      note: toText(form.note),
    }

    try {
      const supabase = createClient()
      const response = editingItem
        ? await supabase.from('game_purchases').update(payload).eq('id', editingItem.id)
        : await supabase.from('game_purchases').insert(payload)

      if (response.error) throw response.error

      setDialogOpen(false)
      await fetchItems()
    } catch (err) {
      setError(getErrorMessage(err, '保存 PS 游戏失败'))
    } finally {
      setSaving(false)
    }
  }

  const deleteItem = async () => {
    if (!deletingItem) return

    setDeleting(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase.from('game_purchases').delete().eq('id', deletingItem.id)

      if (deleteError) throw deleteError

      setDeleteDialogOpen(false)
      setDeletingItem(null)
      await fetchItems()
    } catch (err) {
      setError(getErrorMessage(err, '删除 PS 游戏失败'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon

          return (
            <Card key={metric.label}>
              <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{metric.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Card>
        <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>PS 游戏清单</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">同一张表记录已买和想买，状态可随时切换。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={fetchItems} disabled={loading}>
              <RefreshCw data-icon="inline-start" />
              刷新
            </Button>
            <Button onClick={() => runProtectedAction({ type: 'create' })}>
              <Plus data-icon="inline-start" />
              新增游戏
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                <TabsList>
                  <TabsTrigger value="all">全部</TabsTrigger>
                  <TabsTrigger value="owned">已购买</TabsTrigger>
                  <TabsTrigger value="wishlist">想买</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative w-full lg:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="pl-9"
                  placeholder="搜索名称、开发商、发行商"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-56 items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 size-4 animate-spin" />
                正在读取 Supabase 数据
              </div>
            ) : items.length === 0 ? (
              <EmptyState onCreate={() => runProtectedAction({ type: 'create' })} />
            ) : sortedItems.length === 0 ? (
              <div className="flex min-h-48 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                没有符合条件的 PS 游戏
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-72">游戏</TableHead>
                      <TableHead>发售信息</TableHead>
                      <TableHead>购买信息</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex min-w-72 items-center gap-3">
                            <div className="relative size-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                              {item.coverUrl ? (
                                <button
                                  type="button"
                                  className="block size-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                  onClick={() => setPreviewItem(item)}
                                  title="预览封面"
                                >
                                  <img src={item.coverUrl} alt={item.title} className="size-full object-cover" />
                                </button>
                              ) : (
                                <div className="flex size-full items-center justify-center text-muted-foreground">
                                  <ImagePlus className="size-5" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium">{item.title}</div>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {item.platform ? <Badge variant="secondary">{item.platform}</Badge> : null}
                                {item.format ? <Badge variant="outline">{item.format}</Badge> : null}
                                {item.edition ? <Badge variant="outline">{item.edition}</Badge> : null}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <div>{formatDate(item.releaseDate)}</div>
                          <div>{item.developer || '-'}</div>
                          <div>{item.publisher || '-'}</div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.status === 'owned' ? (
                            <>
                              <div>{formatDate(item.purchaseDate)}</div>
                              <div>{item.store || '-'}</div>
                              <div>{formatCurrency(item.purchasePrice, item.currency)}</div>
                            </>
                          ) : (
                            <div>尚未购买</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.status === 'owned' ? 'default' : 'secondary'}>
                            {statusText[item.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon" onClick={() => runProtectedAction({ type: 'edit', item })} title="编辑">
                              <Edit className="size-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => runProtectedAction({ type: 'delete', item })} title="删除">
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? '编辑 PS 游戏' : '新增 PS 游戏'}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-4">
                <Field label="游戏名称" required>
                  <Input value={form.title} onChange={(event) => updateForm('title', event.target.value)} placeholder="例如 Ghost of Yotei" />
                </Field>
                <Field label="开发商">
                  <Input value={form.developer} onChange={(event) => updateForm('developer', event.target.value)} placeholder="Sucker Punch" />
                </Field>
                <Field label="发行商">
                  <Input value={form.publisher} onChange={(event) => updateForm('publisher', event.target.value)} placeholder="Sony Interactive Entertainment" />
                </Field>
              </div>

              <div className="flex flex-col gap-4">
                <Field label="状态">
                  <Tabs value={form.status} onValueChange={(value) => updateForm('status', value as PsGameStatus)}>
                    <TabsList className="w-full">
                      <TabsTrigger value="wishlist" className="flex-1">想买</TabsTrigger>
                      <TabsTrigger value="owned" className="flex-1">已购买</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </Field>
                <Field label="发售日期">
                  <DatePicker
                    value={form.releaseDate}
                    onChange={(value) => updateForm('releaseDate', value)}
                    placeholder="未公布"
                  />
                </Field>
                <Field label="形式">
                  <OptionSelect
                    value={form.format}
                    onChange={(value) => updateForm('format', value)}
                    options={formatOptions.map((option) => ({ value: option, label: option }))}
                    placeholder="选择形式"
                  />
                </Field>
              </div>
            </div>

            {form.status === 'owned' ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-4">
                  <Field label="币种">
                    <OptionSelect
                      value={form.currency}
                      onChange={(value) => updateForm('currency', value as CurrencyCode)}
                      options={currencyOptions.map((option) => ({ value: option, label: option }))}
                    />
                  </Field>
                  <Field label="购买价格">
                    <Input type="number" value={form.purchasePrice} onChange={(event) => updateForm('purchasePrice', event.target.value)} placeholder="398" />
                  </Field>
                </div>

                <div className="flex flex-col gap-4">
                  <Field label="购买日期">
                    <DatePicker value={form.purchaseDate} onChange={(value) => updateForm('purchaseDate', value)} />
                  </Field>
                  <Field label="购买渠道">
                    <OptionSelect
                      value={form.store}
                      onChange={(value) => updateForm('store', value)}
                      options={storeOptions.map((option) => ({ value: option, label: option }))}
                      placeholder="选择渠道"
                    />
                  </Field>
                </div>
              </div>
            ) : null}

            <Field label="封面 URL">
              <div className="grid gap-3 md:grid-cols-[120px_1fr]">
                <div className="relative size-28 overflow-hidden rounded-md border bg-muted">
                  {form.coverUrl ? (
                    <img src={form.coverUrl} alt="封面预览" className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center text-muted-foreground">
                      <ImagePlus className="size-6" />
                    </div>
                  )}
                </div>
                <Input value={form.coverUrl} onChange={(event) => updateForm('coverUrl', event.target.value)} placeholder="https://..." />
              </div>
            </Field>

            <Field label="备注">
              <Textarea value={form.note} onChange={(event) => updateForm('note', event.target.value)} placeholder="想买原因、等折扣、实体盘备注等" />
            </Field>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              取消
            </Button>
            <Button onClick={saveItem} disabled={saving}>
              {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>删除 PS 游戏</DialogTitle>
            <DialogDescription>确认删除「{deletingItem?.title}」？这条记录会从 Supabase 中移除。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
              取消
            </Button>
            <Button variant="destructive" onClick={deleteItem} disabled={deleting}>
              {deleting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={accessDialogOpen} onOpenChange={handleAccessDialogOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>请输入文本密钥</DialogTitle>
            <DialogDescription>验证通过后，本标签页内可继续新增、编辑或删除 PS 游戏。</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Input
              id="ps-game-access-key"
              value={accessInput}
              onChange={(event) => {
                setAccessInput(event.target.value)
                setAccessError(null)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') submitAccessKey()
              }}
              autoFocus
              placeholder="请输入密钥"
            />
            {accessError ? <p className="text-sm text-destructive">{accessError}</p> : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleAccessDialogOpenChange(false)}>
              取消
            </Button>
            <Button onClick={submitAccessKey}>验证</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(previewItem)} onOpenChange={(open) => (!open ? setPreviewItem(null) : null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewItem?.title ?? '封面预览'}</DialogTitle>
          </DialogHeader>
          {previewItem?.coverUrl ? (
            <div className="relative min-h-[60vh] overflow-hidden rounded-md border bg-muted">
              <img src={previewItem.coverUrl} alt={previewItem.title} className="absolute inset-0 size-full object-contain" />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-md border border-dashed text-center">
      <div className="text-base font-medium">还没有 PS 游戏记录</div>
      <p className="mt-2 text-sm text-muted-foreground">先新增一条已购买或想买的游戏。</p>
      <Button className="mt-4" onClick={onCreate}>
        <Plus data-icon="inline-start" />
        新增游戏
      </Button>
    </div>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>
        {label}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </Label>
      {children}
    </div>
  )
}

type SelectOption = {
  value: string
  label: string
}

function OptionSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
}) {
  const selectedOption = options.find((option) => option.value === value)
  const displayText = selectedOption?.label ?? placeholder ?? '请选择'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between px-3 font-normal"
        >
          <span className={cn('truncate', !selectedOption && 'text-muted-foreground')}>{displayText}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function formatDate(value: string | null) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}

function formatCurrency(value: number | null, currency: CurrencyCode) {
  if (value === null) return '-'

  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}
