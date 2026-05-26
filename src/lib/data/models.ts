import type { Metric, ModelItem } from '@/types'

export function getModelMetrics(items: ModelItem[]): Metric[] {
  const totalOriginal = items.reduce((sum, item) => sum + (item.originalPrice ?? 0), 0)
  const totalPaid = items.reduce((sum, item) => sum + (item.purchasePrice ?? 0), 0)
  const activePreorders = items.filter((item) => item.status === 'preorder').length
  const owned = items.filter((item) => item.status === 'owned').length
  const gifted = items.filter((item) => item.status === 'gifted').length
  const heresy = items.filter((item) => item.series === 'The Horus Heresy').length
  const warhammer40k = items.filter((item) => item.series === 'Warhammer 40,000').length

  return [
    {
      label: '模型数量',
      value: `${items.length}`,
      detail: 'Supabase 记录',
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
    {
      label: '待发货',
      value: `${activePreorders}`,
      detail: `入库${owned} 赠送${gifted}`,
    },
    {
      label: '荷鲁斯之乱',
      value: `${heresy}`,
      detail: 'The Horus Heresy',
    },
    {
      label: '战锤40K',
      value: `${warhammer40k}`,
      detail: 'Warhammer 40,000',
    },
  ]
}

export function parseTags(value: string) {
  return value
    .split(/[,，\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
}
