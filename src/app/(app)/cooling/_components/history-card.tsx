import { Check, ShoppingBag } from 'lucide-react'
import { fmtRM } from '@/lib/formatters'
import { cn } from '@/lib/utils'

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

  return (
    <div className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-card">
      <div
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-sm flex items-center justify-center',
          isSkipped ? 'bg-gold-tint text-gold-deep' : 'bg-coral-tint text-coral-deep',
        )}
      >
        <Icon size={16} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {isSkipped ? 'Skipped' : 'Bought'}
          {item.resolvedAt && ` · ${relativeDate(item.resolvedAt)}`}
        </p>
      </div>
      <span
        className={cn(
          'flex-shrink-0 text-sm font-semibold tabular-nums',
          isSkipped ? 'text-primary' : 'text-foreground',
        )}
      >
        {isSkipped ? '+' : ''}
        {fmtRM(item.amountCents, 0)}
      </span>
    </div>
  )
}
