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
      />

      <ModelItemsManager />
    </AppShell>
  )
}
