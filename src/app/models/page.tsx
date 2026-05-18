import { AppShell } from '@/components/app-shell'
import { ModelItemsManager } from '@/components/models/model-items-manager'
import { PageHeader } from '@/components/page-header'

export default function ModelsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Collections / Models"
        badge="Supabase only"
        title="模型收藏管理"
        description="新增、编辑、删除模型记录，并把图片上传到 Supabase Storage。这个页面不再使用任何本地 mock 数据。"
      />

      <ModelItemsManager />
    </AppShell>
  )
}
