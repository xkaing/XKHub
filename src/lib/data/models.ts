import type { Metric, ModelItem } from '@/types'

export function normalizeModelSeries(value: string | null) {
  const series = value?.trim()
  if (!series) return null

  const seriesMap: Record<string, string> = {
    'Warhammer 40K': 'Warhammer 40,000',
    荷鲁斯之乱: 'The Horus Heresy',
    星际战士2: 'Space Marine 2',
    秘密关卡: 'Secret Level',
  }

  return seriesMap[series] ?? series
}

export function getModelMetrics(items: ModelItem[]): Metric[] {
  const totalOriginal = items.reduce((sum, item) => sum + (item.originalPrice ?? 0), 0)
  const totalPaid = items.reduce((sum, item) => sum + (item.purchasePrice ?? 0), 0)
  const activePreorders = items.filter((item) => item.status === 'preorder').length
  const owned = items.filter((item) => item.status === 'owned').length
  const gifted = items.filter((item) => item.status === 'gifted').length

  return [
    {
      label: '模型数量',
      value: `${items.length}`,
      detail: 'Supabase 记录',
    },
    {
      label: '待发货',
      value: `${activePreorders}`,
      detail: `入库${owned} 赠送${gifted}`,
    },
    {
      label: '原价总额',
      value: `¥${totalOriginal.toLocaleString('zh-CN')}`,
      detail: '按原价汇总',
    },
    {
      label: '实付金额',
      value: `¥${totalPaid.toLocaleString('zh-CN')}`,
      detail: '按购买价汇总',
    },
    {
      label: '节省金额',
      value: `¥${(totalOriginal - totalPaid).toLocaleString('zh-CN')}`,
      detail: '原价减实付',
    },
  ]
}

export function parseTags(value: string) {
  return value
    .split(/[,，\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
}
