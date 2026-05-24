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
    <div className="rounded-[20px] bg-card px-5 py-5 shadow-[0_1px_2px_rgba(31,42,46,0.04),0_4px_16px_rgba(31,42,46,0.04)]">
      <p className="text-[13px] font-semibold uppercase tracking-[0.2px] text-[var(--text-muted)] mb-4">
        Skip rate
      </p>

      <div className="flex items-center gap-5">
        {/* Circular arc */}
        <svg width="72" height="72" viewBox="0 0 72 72" className="flex-shrink-0">
          <circle cx="36" cy="36" r="28" fill="none" stroke="var(--primary-tint)" strokeWidth="6" />
          <circle
            cx="36" cy="36" r="28"
            fill="none"
            stroke="#2D5F5B"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 36 36)"
          />
          <text x="36" y="36" textAnchor="middle" dominantBaseline="central" className="fill-primary" style={{ fontSize: 16, fontWeight: 700, fontFamily: 'inherit' }}>
            {pct}%
          </text>
        </svg>

        <div>
          <p className="text-[32px] font-bold text-primary tabular-nums leading-none tracking-[-1.5px]">{pct}%</p>
          <p className="text-[13px] text-[var(--text-muted)] mt-1.5 leading-snug">{label(pct)}</p>
        </div>
      </div>
    </div>
  )
}
