import { cn } from '@/lib/utils'

type Padding = 'none' | 'sm' | 'md' | 'lg'

const paddings: Record<Padding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-5 lg:p-8',
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: Padding
  elevated?: boolean
}

export function Card({ className, padding = 'md', elevated = true, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-card text-card-foreground',
        elevated && 'shadow-card',
        paddings[padding],
        className,
      )}
      {...props}
    />
  )
}
