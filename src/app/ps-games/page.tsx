import { AppShell } from '@/components/app-shell'
import { PsGameLibraryManager } from '@/components/games/ps-game-library-manager'
import { PageHeader } from '@/components/page-header'

export default function PsGamesPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Games / Library"
        badge="Supabase CRUD"
        title="PS 游戏购买记录"
        description="记录已购买和想买的 PlayStation 游戏，包括封面、发售日期、开发商、发行商和购买信息。"
      />

      <PsGameLibraryManager />
    </AppShell>
  )
}
