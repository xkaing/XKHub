import { createClient, hasSupabaseEnv } from '@/lib/supabase/server'
import { normalizeModelSeries } from '@/lib/data/models'
import type { ModelItem } from '@/types'

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
  currency: ModelItem['currency'] | null
  purchase_platform: string | null
  seller: string | null
  order_no: string | null
  status: string | null
  tags: string[] | null
  note: string | null
  created_at: string
  updated_at: string
}

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeStatus(status: string | null | undefined): ModelItem['status'] {
  if (status === 'gifted') return 'gifted'
  if (status === 'preorder' || status === 'shipped' || status === 'wishlist') return 'preorder'
  return 'owned'
}

function fromRow(row: ModelItemRow): ModelItem {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    ip: row.ip,
    universe: row.universe,
    series: normalizeModelSeries(row.series),
    faction: row.faction,
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

export async function getModelItems(): Promise<ModelItem[]> {
  if (!hasSupabaseEnv) return []

  try {
    const supabase = await createClient()
    // 首页和统计页只读 Supabase，不再回退到任何本地 mock 数据。
    const { data, error } = await supabase
      .from('model_items')
      .select('*')
      .order('purchase_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) return []
    return ((data ?? []) as ModelItemRow[]).map(fromRow)
  } catch {
    return []
  }
}
