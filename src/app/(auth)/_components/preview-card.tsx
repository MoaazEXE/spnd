import { Card } from '@/components/ui/card'

interface Props {
  label: string
  amount: string
  hint: string
}

export function PreviewCard({ label, amount, hint }: Props) {
  return (
    <Card className="mb-6">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-4xl font-bold text-primary tracking-tight tabular-nums">
        {amount}
      </p>
      <div className="mt-2 flex items-center gap-1.5">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="text-gold-deep">
          <path d="M12 3l1.8 5.4L19 10.2 13.8 12 12 17.4 10.2 12 5 10.2l5.2-1.8L12 3z" />
        </svg>
        <span className="text-xs font-medium text-gold-deep">{hint}</span>
      </div>
    </Card>
  )
}
