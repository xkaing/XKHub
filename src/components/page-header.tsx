import { Badge } from '@/components/ui/badge'

interface PageHeaderProps {
  title: string
  description: string
  eyebrow?: string
  badge?: string
}

export function PageHeader({ title, description, eyebrow, badge }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {eyebrow ? <div className="text-sm font-medium text-muted-foreground">{eyebrow}</div> : null}
        {badge ? <Badge variant="secondary">{badge}</Badge> : null}
      </div>
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-normal text-foreground md:text-4xl">{title}</h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
