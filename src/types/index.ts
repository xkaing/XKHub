export type CurrencyCode = 'CNY' | 'USD' | 'JPY'

export interface ModelItem {
  id: string
  name: string
  brand: string
  ip: string | null
  universe: string | null
  series: string | null
  faction: string | null
  characterName: string | null
  imageUrl: string | null
  storagePath: string | null
  purchaseDate: string | null
  originalPrice: number | null
  purchasePrice: number | null
  currency: CurrencyCode
  purchasePlatform: string | null
  seller: string | null
  orderNo: string | null
  status: ModelItemStatus
  tags: string[]
  note: string | null
  createdAt: string
  updatedAt: string
}

export type ModelItemStatus = 'preorder' | 'owned' | 'gifted'

export interface Metric {
  label: string
  value: string
  detail: string
}

export interface DataModule {
  title: string
  description: string
  href: string
  status: 'ready' | 'designing' | 'planned'
  records: string
}
