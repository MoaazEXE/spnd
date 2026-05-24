import { Check, ShoppingBag } from 'lucide-react'
import { fmtRM } from '@/lib/formatters'

interface HistoryItem {
  id: string
  title: string
  amountCents: number
  status: 'SKIPPED' | 'BOUGHT'
  resolvedAt: Date | null
}

function relativeDate(date: Date): string {
  const diff = Date.now() - date.getTime()
  const day = 86_400_000
  if (diff < day) return 'Today'
  if (diff < day * 2) return 'Yesterday'
  if (diff < day * 7) return `${Math.floor(diff / day)}d ago`
  return date.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })
}

export function HistoryCard({ item }: { item: HistoryItem }) {
  const isSkipped = item.status === 'SKIPPED'
  const Icon = isSkipped ? Check : ShoppingBag
  const iconClass = isSkipped
    ? 'bg-[var(--gold-tint)] text-[var(--gold-deep)]'
    : 'bg-[var(--coral-tint)] text-[var(--coral-deep)]'

  return (
    <div className="rounded-[16px] bg-card p-4 shadow-[0_1px_2px_rgba(31,42,46,0.04),0_4px_16px_rgba(31,42,46,0.04)] flex items-center gap-3">
      <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 ${iconClass}`}>
        <Icon size={16} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-foreground truncate">{item.title}</p>
        <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
          {isSkipped ? 'Skipped' : 'Bought'}
          {item.resolvedAt && ` · ${relativeDate(item.resolvedAt)}`}
        </p>
      </div>
      <span className={`text-[15px] font-semibold tabular-nums flex-shrink-0 ${isSkipped ? 'text-primary' : 'text-foreground'}`}>
        {isSkipped ? '+' : ''}{fmtRM(item.amountCents, 0)}
      </span>
    </div>
  )
}
