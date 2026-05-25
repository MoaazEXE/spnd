import { BrandMark } from '@/components/ui/brand-mark'

interface Props {
  eyebrow?: string
  title: React.ReactNode
  description?: string
}

export function AuthHero({ eyebrow, title, description }: Props) {
  return (
    <>
      <div className="mb-8">
        <BrandMark size="md" />
      </div>
      <div className="mb-6">
        {eyebrow && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-base text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>
    </>
  )
}
