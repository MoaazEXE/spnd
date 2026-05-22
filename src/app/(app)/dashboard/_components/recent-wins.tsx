import { fmtRM } from '@/lib/formatters'

interface SkippedItem {
  id: string
  title: string
  amountCents: number
  resolvedAt: Date | null
}

interface Props {
  items: SkippedItem[]
}

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return date.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })
}

export function RecentWins({ items }: Props) {
  if (items.length === 0) return null

  return (
    <section className="px-5 pb-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.4px] text-muted-foreground mb-3">
        Recent wins
      </p>
      <div className="bg-card rounded-[20px] shadow-[0_1px_2px_rgba(31,42,46,0.04),0_4px_16px_rgba(31,42,46,0.04)] divide-y divide-border/60">
        {items.slice(0, 10).map(item => (
          <div key={item.id} className="flex items-center gap-3 px-4 py-3">
            <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[11px] text-primary flex-shrink-0">
              ✓
            </span>
            <span className="flex-1 text-[14px] font-medium text-foreground truncate">{item.title}</span>
            <span className="text-[12px] text-muted-foreground">
              {item.resolvedAt ? relativeTime(item.resolvedAt) : ''}
            </span>
            <span className="text-[14px] font-semibold text-primary tabular-nums">
              +{fmtRM(item.amountCents, 0)}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
