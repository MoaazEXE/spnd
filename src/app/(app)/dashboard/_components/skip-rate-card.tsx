import { Card } from '@/components/ui/card'

interface Props {
  pct: number
}

function label(pct: number): string {
  if (pct >= 80) return "You're crushing it"
  if (pct >= 60) return 'Solid discipline'
  if (pct >= 40) return 'Keep it up'
  return 'Building the habit'
}

export function SkipRateCard({ pct }: Props) {
  const circumference = 2 * Math.PI * 28
  const offset = circumference * (1 - pct / 100)

  return (
    <Card>
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Skip rate
      </p>

      <div className="flex items-center gap-5">
        <svg width="72" height="72" viewBox="0 0 72 72" className="flex-shrink-0">
          <circle cx="36" cy="36" r="28" fill="none" stroke="var(--primary-tint)" strokeWidth="6" />
          <circle
            cx="36"
            cy="36"
            r="28"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 36 36)"
          />
          <text
            x="36"
            y="36"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-primary"
            style={{ fontSize: 16, fontWeight: 700 }}
          >
            {pct}%
          </text>
        </svg>

        <div>
          <p className="text-3xl font-bold leading-none tracking-tight text-primary tabular-nums">
            {pct}%
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground leading-snug">{label(pct)}</p>
        </div>
      </div>
    </Card>
  )
}
