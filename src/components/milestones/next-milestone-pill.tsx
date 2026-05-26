import Link from 'next/link'
import {
  Leaf, Sparkles, Clock, TrendingUp, Users, CheckCircle, ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Milestone } from '@/core/milestones/milestones'

const ICONS = { Leaf, Sparkles, Clock, TrendingUp, Users, CheckCircle }

interface Props {
  milestone: Milestone
  unlockedCount: number
  totalCount: number
}

export function NextMilestonePill({ milestone: m, unlockedCount, totalCount }: Props) {
  const Icon = ICONS[m.icon]
  const pct = Math.round(m.pct * 100)

  return (
    <Link
      href="/profile"
      className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-sep shadow-card hover:shadow-pop transition-shadow group"
    >
      <div
        className={cn(
          'flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center',
          m.color === 'gold' ? 'bg-gold-tint text-gold-deep' : 'bg-primary-tint text-primary-deep',
        )}
      >
        <Icon size={16} strokeWidth={1.8} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <p className="text-label font-semibold text-foreground truncate">
            Next: {m.title}
          </p>
          <span className="text-[11px] tabular-nums text-muted-foreground flex-shrink-0">
            {unlockedCount}/{totalCount} unlocked
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              m.color === 'gold' ? 'bg-gold' : 'bg-primary',
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground truncate">{m.desc} · {pct}%</p>
      </div>

      <ArrowRight size={14} strokeWidth={1.8} className="flex-shrink-0 text-subtle-foreground group-hover:text-foreground transition-colors" />
    </Link>
  )
}
