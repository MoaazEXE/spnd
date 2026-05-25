import { Card } from './card'

interface Props {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function EmptyState({ title, subtitle, icon, action }: Props) {
  return (
    <Card padding="none" className="py-12 px-5 text-center">
      {icon && <div className="mb-3 flex justify-center">{icon}</div>}
      <p className="text-base font-semibold text-foreground">{title}</p>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </Card>
  )
}
