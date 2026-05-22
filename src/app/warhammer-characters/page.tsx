import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CharacterImageGallery } from '@/components/warhammer/character-image-gallery'
import {
  getWarhammerCharacterStats,
  getWarhammerForcesByEra,
  type WarhammerAllegiance,
  type WarhammerCharacter,
  type WarhammerEra,
  warhammerEraOptions,
} from '@/lib/data/warhammer-characters'

const allegianceOrder: WarhammerAllegiance[] = [
  '叛乱派核心',
  '忠诚派核心',
  '忠诚派 / 反叛荷鲁斯者',
  '军团组织',
  '混淆项',
]

const featuredNames = new Set([
  '荷鲁斯·卢佩卡尔',
  '伊泽凯尔·阿巴顿',
  '加维尔·洛肯',
  '塔里克·托加顿',
  '霍鲁斯·阿克西曼德',
  '科拉克斯',
  '阿加皮托·内夫',
  '布兰恩·内夫',
  '尼科纳·沙罗金',
  '凯德斯·奈克斯',
])

export default function WarhammerCharactersPage() {
  const stats = getWarhammerCharacterStats()

  return (
    <AppShell>
      <PageHeader
        eyebrow="Warhammer / Characters"
        badge="30K seeded"
        title="战锤人物"
        description="按时间段、军团或战团整理人物谱系。当前录入战锤 30K 荷鲁斯之乱时期的影月苍狼 / 荷鲁斯之子与暗鸦守卫。"
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="时间段" value={`${stats.eras} / 2`} detail="30K 已录入，40K 结构预留" />
        <StatCard label="军团 / 战团" value={String(stats.forces)} detail="已录入 30K 军团谱系" />
        <StatCard label="人物与组织" value={String(stats.characters)} detail="含核心人物、忠诚派、组织与混淆项" />
      </section>

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
              <CardHeader className="gap-4 md:flex-row md:items-start md:justify-between md:space-y-0">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{force.era}</Badge>
                    <Badge variant="secondary">{force.period}</Badge>
                    <Badge variant="outline">{force.forceType}</Badge>
                  </div>
                  <CardTitle className="mt-3 text-2xl">{force.name}</CardTitle>
                  <CardDescription className="mt-2 text-sm leading-6">{force.nameEn}</CardDescription>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{force.summary}</p>
                </div>
                <div className="grid min-w-56 gap-2 rounded-md border bg-muted/30 p-3 text-sm">
                  <NameLine label="旧名" value={force.formerName} subValue={force.formerNameEn} />
                  <NameLine label="后名" value={force.laterName} subValue={force.laterNameEn} />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                  {force.characters
                    .filter((character) => featuredNames.has(character.nameCn))
                    .map((character) => (
                      <div key={character.nameEn} className="rounded-md border p-3">
                        <div className="text-sm font-medium">{character.nameCn}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{character.nameEn}</div>
                      </div>
                    ))}
                </section>

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

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{detail}</CardContent>
    </Card>
  )
}

function NameLine({ label, value, subValue }: { label: string; value?: string; subValue?: string }) {
  if (!value) return null

  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">
        <span className="block font-medium">{value}</span>
        {subValue ? <span className="block text-xs text-muted-foreground">{subValue}</span> : null}
      </span>
    </div>
  )
}

function groupCharactersByAllegiance(characters: WarhammerCharacter[]) {
  return characters.reduce<Partial<Record<WarhammerAllegiance, WarhammerCharacter[]>>>((acc, character) => {
    acc[character.allegiance] = [...(acc[character.allegiance] ?? []), character]
    return acc
  }, {})
}
