import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CharacterImageGallery } from '@/components/warhammer/character-image-gallery'
import {
  getWarhammerForcesByEra,
  type WarhammerAllegiance,
  type WarhammerCharacter,
  type WarhammerEra,
  type WarhammerForce,
  warhammerEraOptions,
} from '@/lib/data/warhammer-characters'

const allegianceOrder: WarhammerAllegiance[] = [
  '叛乱派核心',
  '忠诚派核心',
  '忠诚派 / 反叛荷鲁斯者',
  '军团组织',
  '混淆项',
]

export default function WarhammerCharactersPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Warhammer / Characters"
        badge="30K seeded"
        title="战锤人物"
        description="按时间段、军团或战团整理人物谱系。当前录入战锤 30K 荷鲁斯之乱时期的荷鲁斯之子与暗鸦守卫。"
      />

      <Tabs defaultValue="30K" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          {warhammerEraOptions.map((era) => (
            <TabsTrigger key={era} value={era} className="min-w-20">
              {era}
            </TabsTrigger>
          ))}
        </TabsList>

        {warhammerEraOptions.map((era) => (
          <TabsContent key={era} value={era} className="space-y-4">
            <EraForces era={era} />
          </TabsContent>
        ))}
      </Tabs>
    </AppShell>
  )
}

function EraForces({ era }: { era: WarhammerEra }) {
  const forces = getWarhammerForcesByEra(era)

  if (forces.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        这个时间段还没有录入人物。
      </div>
    )
  }

  return (
    <Tabs defaultValue={forces[0]?.id} className="space-y-4">
      <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
        {forces.map((force) => (
          <TabsTrigger key={force.id} value={force.id} className="min-w-fit">
            {force.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {forces.map((force) => {
        const groupedCharacters = groupCharactersByAllegiance(force.characters)

        return (
          <TabsContent key={force.id} value={force.id} className="mt-0">
            <Card>
              <CardHeader>
                <div className="max-w-3xl">
                  <CardTitle className="text-2xl">{getForceTitle(force)}</CardTitle>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{force.summary}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {allegianceOrder.map((allegiance) => {
                  const characters = groupedCharacters[allegiance] ?? []

                  if (characters.length === 0) return null

                  return (
                    <section key={allegiance} className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold">{allegiance}</h2>
                        <Badge variant="secondary">{characters.length}</Badge>
                      </div>
                      <div className="grid gap-3 lg:grid-cols-2">
                        {characters.map((character) => (
                          <CharacterCard key={character.nameEn} character={character} />
                        ))}
                      </div>
                    </section>
                  )
                })}
              </CardContent>
            </Card>
          </TabsContent>
        )
      })}
    </Tabs>
  )
}

function CharacterCard({ character }: { character: WarhammerCharacter }) {
  const images = character.images ?? []

  return (
    <article className={`relative rounded-md border p-4 ${images.length > 0 ? 'pb-20' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{character.nameCn}</h3>
          <div className="mt-1 text-sm text-muted-foreground">{character.nameEn}</div>
        </div>
        <Badge variant={character.allegiance === '混淆项' ? 'outline' : 'secondary'}>{character.identity}</Badge>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{character.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {character.keywords.map((keyword) => (
          <Badge key={keyword} variant="outline">
            {keyword}
          </Badge>
        ))}
      </div>
      <CharacterImageGallery characterName={character.nameCn} images={images} />
    </article>
  )
}

function groupCharactersByAllegiance(characters: WarhammerCharacter[]) {
  return characters.reduce<Partial<Record<WarhammerAllegiance, WarhammerCharacter[]>>>((acc, character) => {
    acc[character.allegiance] = [...(acc[character.allegiance] ?? []), character]
    return acc
  }, {})
}

function getForceTitle(force: WarhammerForce) {
  const cnTitle = [force.legionNumber, force.name].filter(Boolean).join('，')
  return [cnTitle, force.nameEn].filter(Boolean).join(' ')
}
