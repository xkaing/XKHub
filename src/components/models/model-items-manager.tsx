'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'
import Image from 'next/image'
import { ArrowDown, ArrowUp, ArrowUpDown, Calendar, ChevronDown, Edit, ImagePlus, Loader2, Plus, RefreshCw, Trash2 } from 'lucide-react'

import { MetricCard } from '@/components/metric-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { getModelMetrics, parseTags } from '@/lib/data/models'
import type { CurrencyCode, ModelItem, ModelItemStatus } from '@/types'

type ModelItemRow = {
  id: string
  name: string
  brand: string
  ip: string | null
  universe: string | null
  series: string | null
  faction: string | null
  character_name: string | null
  image_url: string | null
  storage_path: string | null
  purchase_date: string | null
  original_price: number | string | null
  purchase_price: number | string | null
  currency: CurrencyCode | null
  purchase_platform: string | null
  seller: string | null
  order_no: string | null
  status: string | null
  tags: string[] | null
  note: string | null
  created_at: string
  updated_at: string
}

type ModelFormState = {
  name: string
  brand: string
  ip: string
  universe: string
  series: string
  faction: string
  characterName: string
  imageUrl: string
  storagePath: string
  purchaseDate: string
  originalPrice: string
  purchasePrice: string
  currency: CurrencyCode
  purchasePlatform: string
  seller: string
  orderNo: string
  status: ModelItemStatus
  tags: string
  note: string
}

type SortKey = 'price' | 'status' | 'purchaseDate'
type SortDirection = 'asc' | 'desc'
type FilterState = {
  series: string[]
  faction: string[]
  characterName: string[]
}

const emptyForm: ModelFormState = {
  name: '',
  brand: 'JOYTOY',
  ip: 'Warhammer',
  universe: 'Warhammer 40K',
  series: 'Warhammer 40,000',
  faction: '',
  characterName: '',
  imageUrl: '',
  storagePath: '',
  purchaseDate: new Date().toISOString().slice(0, 10),
  originalPrice: '',
  purchasePrice: '',
  currency: 'CNY',
  purchasePlatform: '淘宝',
  seller: '暗源旗舰店',
  orderNo: '',
  status: 'owned',
  tags: '',
  note: '',
}

const statusText: Record<ModelItemStatus, string> = {
  preorder: '预定',
  owned: '入库',
  gifted: '赠送',
}

const statusOptions: Array<{ value: ModelItemStatus; label: string }> = [
  { value: 'preorder', label: '预定' },
  { value: 'owned', label: '入库' },
  { value: 'gifted', label: '赠送' },
]

const brandOptions = ['JOYTOY', 'LEGO', 'BANDAI']
const ipOptions = ['Warhammer', 'GUNDAM']
const universeOptions = ['Warhammer 30K', 'Warhammer 40K']
const seriesOptions = ['Warhammer 40,000', 'The Horus Heresy', 'Space Marine 2', 'Secret Level']
const purchasePlatformOptions = ['淘宝', '京东', '咸鱼', '线下店', '线下会展']
const sellerOptions = ['暗源旗舰店', '暗源线下店', '会展展台']
const characterRoleOptions = ['连长', '战团长', '基因原体']

const legionGroups = [
  {
    label: '忠诚派',
    options: [
      '第一军团 暗黑天使',
      '第五军团 白色伤疤',
      '第六军团 太空野狼',
      '第七军团 帝国之拳',
      '第九军团 圣血天使',
      '第十军团 钢铁之手',
      '第十三军团 极限战士',
      '第十八军团 火蜥蜴',
      '第十九军团 暗鸦守卫',
    ],
  },
  {
    label: '叛乱派',
    options: [
      '第三军团 帝皇之子',
      '第四军团 钢铁勇士',
      '第八军团 暗夜领主',
      '第十二军团 吞世者',
      '第十四军团 死亡守卫',
      '第十五军团 千子',
      '第十六军团 荷鲁斯之子',
      '第十七军团 怀言者',
      '第二十军团 阿尔法军团',
    ],
  },
  {
    label: '其他',
    options: ['禁军', '修女'],
  },
  {
    label: '二次建军',
    options: ['黑色军团', '黑色圣堂', '堕落天使'],
  },
]

const bucketName = process.env.NEXT_PUBLIC_SUPABASE_MODEL_IMAGES_BUCKET || 'model-images'

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function toText(value: string | null | undefined) {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

function formatFaction(value: string | null) {
  if (!value) return null
  return value
    .replace(/\s+Dark Angels$/, '')
    .replace(/\s+White Scars$/, '')
    .replace(/\s+Space Wolves$/, '')
    .replace(/\s+Imperial Fists$/, '')
    .replace(/\s+Blood Angels$/, '')
    .replace(/\s+Iron Hands$/, '')
    .replace(/\s+Ultramarines$/, '')
    .replace(/\s+Salamanders$/, '')
    .replace(/\s+Raven Guard$/, '')
    .replace(/\s+Emperor's Children$/, '')
    .replace(/\s+Iron Warriors$/, '')
    .replace(/\s+Night Lords$/, '')
    .replace(/\s+World Eaters$/, '')
    .replace(/\s+Death Guard$/, '')
    .replace(/\s+Thousand Sons$/, '')
    .replace(/\s+Sons of Horus$/, '')
    .replace(/\s+Word Bearers$/, '')
    .replace(/\s+Alpha Legion$/, '')
}

function formatSeries(value: string | null) {
  if (!value) return null

  const seriesMap: Record<string, string> = {
    'Warhammer 40K': 'Warhammer 40,000',
    荷鲁斯之乱: 'The Horus Heresy',
    星际战士2: 'Space Marine 2',
    秘密关卡: 'Secret Level',
  }

  return seriesMap[value] ?? value
}

function fromRow(row: ModelItemRow): ModelItem {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    ip: row.ip,
    universe: row.universe,
    series: formatSeries(row.series),
    faction: formatFaction(row.faction),
    characterName: row.character_name,
    imageUrl: row.image_url,
    storagePath: row.storage_path,
    purchaseDate: row.purchase_date,
    originalPrice: toNumber(row.original_price),
    purchasePrice: toNumber(row.purchase_price),
    currency: row.currency ?? 'CNY',
    purchasePlatform: row.purchase_platform,
    seller: row.seller,
    orderNo: row.order_no,
    status: normalizeStatus(row.status),
    tags: row.tags ?? [],
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function formFromItem(item: ModelItem): ModelFormState {
  return {
    name: item.name,
    brand: item.brand,
    ip: item.ip ?? '',
    universe: item.universe ?? '',
    series: item.series ?? '',
    faction: item.faction ?? '',
    characterName: item.characterName ?? '',
    imageUrl: item.imageUrl ?? '',
    storagePath: item.storagePath ?? '',
    purchaseDate: item.purchaseDate ?? '',
    originalPrice: item.originalPrice?.toString() ?? '',
    purchasePrice: item.purchasePrice?.toString() ?? '',
    currency: item.currency,
    purchasePlatform: item.purchasePlatform ?? '',
    seller: item.seller ?? '',
    orderNo: item.orderNo ?? '',
    status: item.status,
    tags: item.tags.join(', '),
    note: item.note ?? '',
  }
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-')
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return fallback
}

function getStatusRank(status: ModelItemStatus) {
  return statusOptions.findIndex((option) => option.value === status)
}

function normalizeStatus(status: string | null | undefined): ModelItemStatus {
  if (status === 'gifted') return 'gifted'
  if (status === 'preorder' || status === 'shipped' || status === 'wishlist') return 'preorder'
  return 'owned'
}

function uniqueOptions(values: Array<string | null>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))))
}

export function ModelItemsManager() {
  const [items, setItems] = useState<ModelItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ModelItem | null>(null)
  const [previewItem, setPreviewItem] = useState<ModelItem | null>(null)
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection } | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    series: [],
    faction: [],
    characterName: [],
  })
  const [form, setForm] = useState<ModelFormState>(emptyForm)

  const metrics = useMemo(() => getModelMetrics(items), [items])
  const seriesFilterOptions = useMemo(
    () => uniqueOptions([...seriesOptions, ...items.map((item) => item.series)]),
    [items]
  )
  const factionFilterOptions = useMemo(
    () => uniqueOptions([...legionGroups.flatMap((group) => group.options), ...items.map((item) => item.faction)]),
    [items]
  )
  const characterFilterOptions = useMemo(
    () => uniqueOptions([...characterRoleOptions, ...items.map((item) => item.characterName)]),
    [items]
  )
  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const matchesSeries = filters.series.length === 0 || (item.series ? filters.series.includes(item.series) : false)
        const matchesFaction = filters.faction.length === 0 || (item.faction ? filters.faction.includes(item.faction) : false)
        const matchesCharacter =
          filters.characterName.length === 0 || (item.characterName ? filters.characterName.includes(item.characterName) : false)

        return matchesSeries && matchesFaction && matchesCharacter
      }),
    [filters, items]
  )
  const sortedItems = useMemo(() => {
    if (!sort) return filteredItems

    return [...filteredItems].sort((first, second) => {
      let result = 0

      if (sort.key === 'price') {
        const firstPrice = first.purchasePrice
        const secondPrice = second.purchasePrice
        const firstMissing = firstPrice === null
        const secondMissing = secondPrice === null

        if (firstMissing && secondMissing) return 0
        if (firstMissing) return 1
        if (secondMissing) return -1
        result = firstPrice - secondPrice
      } else if (sort.key === 'purchaseDate') {
        const firstDate = first.purchaseDate ? new Date(first.purchaseDate).getTime() : null
        const secondDate = second.purchaseDate ? new Date(second.purchaseDate).getTime() : null
        const firstMissing = firstDate === null || Number.isNaN(firstDate)
        const secondMissing = secondDate === null || Number.isNaN(secondDate)

        if (firstMissing && secondMissing) return 0
        if (firstMissing) return 1
        if (secondMissing) return -1
        result = firstDate - secondDate
      } else {
        result = getStatusRank(first.status) - getStatusRank(second.status)
      }

      return sort.direction === 'asc' ? result : -result
    })
  }, [filteredItems, sort])

  const updateForm = <K extends keyof ModelFormState>(key: K, value: ModelFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const toggleSort = (key: SortKey) => {
    setSort((current) => {
      if (current?.key !== key) return { key, direction: 'asc' }
      return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
    })
  }

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  const toggleFilter = <K extends keyof FilterState>(key: K, option: string) => {
    setFilters((current) => {
      const selected = current[key]
      const next = selected.includes(option) ? selected.filter((value) => value !== option) : [...selected, option]
      return { ...current, [key]: next }
    })
  }

  const fetchItems = async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      // 列表页直接读取 Supabase，确保后台展示的是数据库里的真实记录。
      const { data, error: queryError } = await supabase
        .from('model_items')
        .select('*')
        .order('purchase_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (queryError) throw queryError
      setItems(((data ?? []) as ModelItemRow[]).map(fromRow))
    } catch (err) {
      const message = getErrorMessage(err, '读取模型数据失败')
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const openCreateDialog = () => {
    setEditingItem(null)
    setForm({ ...emptyForm, purchaseDate: new Date().toISOString().slice(0, 10) })
    setDialogOpen(true)
  }

  const openEditDialog = (item: ModelItem) => {
    setEditingItem(item)
    setForm(formFromItem(item))
    setDialogOpen(true)
  }

  const uploadImage = async (file: File) => {
    setUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      const path = `models/${new Date().getFullYear()}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`
      // 图片先进入 Storage，再把公开 URL 和存储路径写入模型记录。
      const { error: uploadError } = await supabase.storage.from(bucketName).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(path)

      updateForm('imageUrl', publicUrl)
      updateForm('storagePath', path)
    } catch (err) {
      const message = getErrorMessage(err, '图片上传失败')
      setError(message)
    } finally {
      setUploading(false)
    }
  }

  const saveItem = async () => {
    if (!form.name.trim()) {
      setError('请输入模型名称')
      return
    }

    setSaving(true)
    setError(null)

    const payload = {
      name: form.name.trim(),
      brand: form.brand.trim() || 'JOYTOY',
      ip: toText(form.ip),
      universe: toText(form.universe),
      series: toText(form.series),
      faction: toText(form.faction),
      character_name: toText(form.characterName),
      image_url: toText(form.imageUrl),
      storage_path: toText(form.storagePath),
      purchase_date: toText(form.purchaseDate),
      original_price: toNumber(form.originalPrice),
      purchase_price: toNumber(form.purchasePrice),
      currency: form.currency,
      purchase_platform: toText(form.purchasePlatform),
      seller: toText(form.seller),
      order_no: toText(form.orderNo),
      status: form.status,
      tags: parseTags(form.tags),
      note: toText(form.note),
    }

    try {
      const supabase = createClient()
      // 新增和编辑共用同一个 payload，减少两个表单路径的数据差异。
      const response = editingItem
        ? await supabase.from('model_items').update(payload).eq('id', editingItem.id)
        : await supabase.from('model_items').insert(payload)

      if (response.error) throw response.error

      setDialogOpen(false)
      await fetchItems()
    } catch (err) {
      const message = getErrorMessage(err, '保存模型失败')
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const deleteItem = async (item: ModelItem) => {
    const confirmed = window.confirm(`确定删除「${item.name}」吗？`)
    if (!confirmed) return

    setError(null)

    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase.from('model_items').delete().eq('id', item.id)
      if (deleteError) throw deleteError
      await fetchItems()
    } catch (err) {
      const message = getErrorMessage(err, '删除模型失败')
      setError(message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Card>
        <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>模型列表</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchItems} disabled={loading}>
              <RefreshCw className="mr-2 size-4" />
              刷新
            </Button>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 size-4" />
              新增模型
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" />
              正在读取 Supabase 数据
            </div>
          ) : items.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed text-center">
              <div className="text-base font-medium">还没有模型记录</div>
              <p className="mt-2 text-sm text-muted-foreground">先新增一条模型数据，之后所有展示和统计都会来自 Supabase。</p>
              <Button className="mt-4" onClick={openCreateDialog}>
                <Plus className="mr-2 size-4" />
                新增模型
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <MultiFilterSelect
                  label="系列"
                  value={filters.series}
                  onClear={() => updateFilter('series', [])}
                  onToggle={(value) => toggleFilter('series', value)}
                  options={seriesFilterOptions}
                  allLabel="全部系列"
                />
                <MultiFilterSelect
                  label="军团"
                  value={filters.faction}
                  onClear={() => updateFilter('faction', [])}
                  onToggle={(value) => toggleFilter('faction', value)}
                  options={factionFilterOptions}
                  allLabel="全部军团"
                />
                <MultiFilterSelect
                  label="角色"
                  value={filters.characterName}
                  onClear={() => updateFilter('characterName', [])}
                  onToggle={(value) => toggleFilter('characterName', value)}
                  options={characterFilterOptions}
                  allLabel="全部角色"
                />
              </div>

              {sortedItems.length === 0 ? (
                <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                  没有符合条件的模型
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">图片</TableHead>
                      <TableHead className="w-36">名称</TableHead>
                      <TableHead>分类</TableHead>
                      <TableHead>
                        <SortHeaderButton
                          active={sort?.key === 'purchaseDate'}
                          direction={sort?.direction}
                          onClick={() => toggleSort('purchaseDate')}
                        >
                          购买
                        </SortHeaderButton>
                      </TableHead>
                      <TableHead className="w-22 text-right">
                        <SortHeaderButton
                          active={sort?.key === 'price'}
                          direction={sort?.direction}
                          align="right"
                          onClick={() => toggleSort('price')}
                        >
                          价格
                        </SortHeaderButton>
                      </TableHead>
                      <TableHead className="w-22 text-right">优惠</TableHead>
                      <TableHead className="w-22 text-right">
                        <SortHeaderButton
                          active={sort?.key === 'status'}
                          direction={sort?.direction}
                          align="right"
                          onClick={() => toggleSort('status')}
                        >
                          状态
                        </SortHeaderButton>
                      </TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="relative size-14 overflow-hidden rounded-md border bg-muted">
                            {item.imageUrl ? (
                              <button
                                type="button"
                                className="block size-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                onClick={() => setPreviewItem(item)}
                                title="预览图片"
                              >
                                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="56px" />
                              </button>
                            ) : (
                              <div className="flex size-full items-center justify-center text-muted-foreground">
                                <ImagePlus className="size-5" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="w-48">
                          <div className="font-medium">{item.name}</div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {[item.faction, item.characterName].filter(Boolean).join(' / ') || '-'}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <div>{item.ip || '-'}</div>
                          <div>{item.series || '-'}</div>
                        </TableCell>
                        <TableCell className="w-36 text-sm text-muted-foreground">
                          <div>{item.purchaseDate || '-'}</div>
                          <div>{[item.purchasePlatform, item.seller].filter(Boolean).join(' / ')}</div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right">
                          <div className="font-medium">
                            {item.purchasePrice === null ? '-' : `¥${item.purchasePrice.toLocaleString('zh-CN')}`}
                          </div>
                          <div className="whitespace-nowrap text-xs text-muted-foreground">
                            原价 {item.originalPrice === null ? '-' : `¥${item.originalPrice.toLocaleString('zh-CN')}`}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right">
                          {item.originalPrice === null || item.purchasePrice === null
                            ? '-'
                            : `¥${(item.originalPrice - item.purchasePrice).toLocaleString('zh-CN')}`}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right">
                          <Badge
                            className="whitespace-nowrap"
                            variant={item.status === 'preorder' ? 'destructive' : 'secondary'}
                          >
                            {statusText[item.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon" onClick={() => openEditDialog(item)} title="编辑">
                              <Edit className="size-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => deleteItem(item)} title="删除">
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? '编辑模型' : '新增模型'}</DialogTitle>
            <DialogDescription>保存后会写入 Supabase `model_items` 表。图片会先上传到 Storage。</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="名称" required>
              <Input value={form.name} onChange={(event) => updateForm('name', event.target.value)} placeholder="模型名称" />
            </Field>
            <Field label="品牌">
              <Select value={form.brand} onChange={(value) => updateForm('brand', value)} options={brandOptions} />
            </Field>
            <Field label="IP">
              <Select value={form.ip} onChange={(value) => updateForm('ip', value)} options={ipOptions} />
            </Field>
            <Field label="宇宙/时代">
              <Select value={form.universe} onChange={(value) => updateForm('universe', value)} options={universeOptions} />
            </Field>
            <Field label="系列">
              <Select value={form.series} onChange={(value) => updateForm('series', value)} options={seriesOptions} />
            </Field>
            <Field label="阵营">
              <GroupedSelect
                value={form.faction}
                onChange={(value) => updateForm('faction', value)}
                groups={legionGroups}
                placeholder="选择军团"
              />
            </Field>
            <Field label="角色/单位">
              <OptionalSelect
                value={form.characterName}
                onChange={(value) => updateForm('characterName', value)}
                options={characterRoleOptions}
                placeholder="不选择"
              />
            </Field>
            <Field label="状态">
              <select
                value={form.status}
                onChange={(event) => updateForm('status', event.target.value as ModelItemStatus)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="购买日期">
              <DateInput value={form.purchaseDate} onChange={(value) => updateForm('purchaseDate', value)} />
            </Field>
            <Field label="原价">
              <Input type="number" value={form.originalPrice} onChange={(event) => updateForm('originalPrice', event.target.value)} placeholder="269" />
            </Field>
            <Field label="实付">
              <Input type="number" value={form.purchasePrice} onChange={(event) => updateForm('purchasePrice', event.target.value)} placeholder="199" />
            </Field>
            <Field label="购买平台">
              <Select
                value={form.purchasePlatform}
                onChange={(value) => updateForm('purchasePlatform', value)}
                options={purchasePlatformOptions}
              />
            </Field>
            <Field label="卖家">
              <Select value={form.seller} onChange={(value) => updateForm('seller', value)} options={sellerOptions} />
            </Field>
            <Field label="标签">
              <Input value={form.tags} onChange={(event) => updateForm('tags', event.target.value)} placeholder="40K, 待发货, Ultramarines" />
            </Field>
            <div className="md:col-span-2">
              <Field label="图片">
                <div className="grid gap-3 md:grid-cols-[120px_1fr]">
                  <div className="relative size-28 overflow-hidden rounded-md border bg-muted">
                    {form.imageUrl ? (
                      <Image src={form.imageUrl} alt="模型图片预览" fill className="object-cover" sizes="112px" />
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted-foreground">
                        <ImagePlus className="size-6" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <Input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (file) uploadImage(file)
                      }}
                      disabled={uploading}
                    />
                    <Input value={form.imageUrl} onChange={(event) => updateForm('imageUrl', event.target.value)} placeholder="图片 URL" />
                    {uploading ? (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        正在上传到 Supabase Storage
                      </div>
                    ) : null}
                  </div>
                </div>
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="备注">
                <Textarea value={form.note} onChange={(event) => updateForm('note', event.target.value)} placeholder="补充说明、到货情况、配件信息等" />
              </Field>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving || uploading}>
              取消
            </Button>
            <Button onClick={saveItem} disabled={saving || uploading}>
              {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(previewItem)} onOpenChange={(open) => (!open ? setPreviewItem(null) : null)}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{previewItem?.name ?? '图片预览'}</DialogTitle>
          </DialogHeader>
          {previewItem?.imageUrl ? (
            <div className="relative min-h-[60vh] overflow-hidden rounded-md border bg-muted">
              <Image src={previewItem.imageUrl} alt={previewItem.name} fill className="object-contain" sizes="90vw" />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SortHeaderButton({
  active,
  direction,
  align = 'left',
  onClick,
  children,
}: {
  active: boolean
  direction?: SortDirection
  align?: 'left' | 'right'
  onClick: () => void
  children: React.ReactNode
}) {
  const Icon = active ? (direction === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown

  return (
    <button
      type="button"
      className={`inline-flex w-full items-center gap-1 whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-foreground ${align === 'right' ? 'justify-end' : 'justify-start'
        }`}
      onClick={onClick}
    >
      {children}
      <Icon className="size-3.5" />
    </button>
  )
}

function MultiFilterSelect({
  label,
  value,
  onClear,
  onToggle,
  options,
  allLabel,
}: {
  label: string
  value: string[]
  onClear: () => void
  onToggle: (value: string) => void
  options: string[]
  allLabel: string
}) {
  const displayText = value.length === 0 ? allLabel : value.length === 1 ? value[0] : `已选 ${value.length} 项`

  return (
    <div className="space-y-2 text-sm font-medium">
      <div>{label}</div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between px-3 font-normal">
            <span className="truncate">{displayText}</span>
            <ChevronDown className="ml-2 size-4 shrink-0 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="start">
          <DropdownMenuItem onClick={onClear}>{allLabel}</DropdownMenuItem>
          <DropdownMenuSeparator />
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option}
              checked={value.includes(option)}
              onCheckedChange={() => onToggle(option)}
              onSelect={(event) => event.preventDefault()}
            >
              {option}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
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
    <div className="space-y-2">
      <Label>
        {label}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </Label>
      {children}
    </div>
  )
}

function DateInput({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pr-10 date-picker-input"
      />
      <button
        type="button"
        className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        onClick={() => {
          inputRef.current?.showPicker?.()
          inputRef.current?.focus()
        }}
        title="选择日期"
      >
        <Calendar className="size-4" />
      </button>
    </div>
  )
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (value: string) => void
  options: string[]
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

function GroupedSelect({
  value,
  onChange,
  groups,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  groups: Array<{ label: string; options: string[] }>
  placeholder?: string
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <option value="">{placeholder ?? '请选择'}</option>
      {groups.map((group) => (
        <optgroup key={group.label} label={group.label}>
          {group.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}

function OptionalSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <option value="">{placeholder ?? '不选择'}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}
