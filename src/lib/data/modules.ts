import type { DataModule } from '@/types'

export const dataModules: DataModule[] = [
  {
    title: '模型收藏',
    description: 'JOYTOY、战锤系列、购买价、状态和图片资产。',
    href: '/models',
    status: 'ready',
    records: 'Supabase CRUD',
  },
  {
    title: '游戏档案',
    description: '购买平台、游戏状态、游玩时间、通关与白金进度。',
    href: '/games',
    status: 'designing',
    records: 'schema draft',
  },
  {
    title: 'PSN 奖杯',
    description: '奖杯完成率、白金记录、稀有度、系列进度。',
    href: '/games',
    status: 'planned',
    records: 'planned',
  },
  {
    title: '金额统计',
    description: '按年度、平台、IP、类型聚合所有消费。',
    href: '/insights',
    status: 'designing',
    records: 'derived',
  },
  {
    title: 'AI 助手',
    description: '自然语言查询个人数据，生成报告和落地页草稿。',
    href: '/ai',
    status: 'planned',
    records: 'tooling',
  },
]
