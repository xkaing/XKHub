import type { Metric, ModelItem } from '@/types'

export function getModelMetrics(items: ModelItem[]): Metric[] {
  const totalOriginal = items.reduce((sum, item) => sum + (item.originalPrice ?? 0), 0)
  const totalPaid = items.reduce((sum, item) => sum + (item.purchasePrice ?? 0), 0)
  const activePreorders = items.filter((item) => item.status === 'preorder' || item.status === 'shipped').length
  const owned = items.filter((item) => item.status === 'owned').length

  return [
    {
      label: '模型数量',
      value: `${items.length}`,
      detail: 'Supabase 记录',
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
      label: '待跟进',
      value: `${activePreorders}`,
      detail: `已入库 ${owned} 件`,
    },
  ]
}

export function parseTags(value: string) {
  return value
    .split(/[,，\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
}
