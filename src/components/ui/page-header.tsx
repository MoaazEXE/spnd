import { cn } from '@/lib/utils'

interface Props {
  title: string
  subtitle?: string
  display?: boolean
  className?: string
}

export function PageHeader({ title, subtitle, display = false, className }: Props) {
  return (
    <header className={cn('mb-5', className)}>
      <h1
        className={cn(
          'text-3xl lg:text-4xl font-semibold tracking-tight text-foreground',
          display && 'font-display',
        )}
      >
        {title}
      </h1>
      {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
    </header>
  )
}
