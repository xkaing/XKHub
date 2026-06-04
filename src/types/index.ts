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

export type PsGameStatus = 'owned' | 'wishlist'

export interface PsGameItem {
  id: string
  gameId: string | null
  title: string
  coverUrl: string | null
  releaseDate: string | null
  developer: string | null
  publisher: string | null
  platform: string | null
  status: PsGameStatus
  purchaseDate: string | null
  purchasePrice: number | null
  currency: CurrencyCode
  store: string | null
  orderNo: string | null
  edition: string | null
  format: string | null
  note: string | null
  createdAt: string
  updatedAt: string
}

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
