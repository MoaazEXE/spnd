import {
  Leaf, Sparkles, Clock, TrendingUp, Users, CheckCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Milestone } from '@/core/milestones/milestones'

const ICONS = { Leaf, Sparkles, Clock, TrendingUp, Users, CheckCircle }

interface Props {
  milestone: Milestone
}

export function MilestoneCard({ milestone: m }: Props) {
  const Icon = ICONS[m.icon]
  return (
    <div
      className={cn(
        'rounded-2xl p-4 transition-all',
        m.unlocked
          ? 'bg-card shadow-card border border-primary-soft'
          : 'bg-muted/40 border border-dashed border-sep-strong opacity-70',
      )}
    >
      <div
        className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center mb-2.5',
          m.unlocked
            ? m.color === 'gold' ? 'bg-gold-tint text-gold-deep' : 'bg-primary-tint text-primary-deep'
            : 'bg-card text-subtle-foreground',
        )}
      >
        <Icon size={18} strokeWidth={1.8} />
      </div>
      <p className="text-sm font-semibold text-foreground">{m.title}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{m.desc}</p>
      {!m.unlocked && !m.gated && (
        <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              m.color === 'gold' ? 'bg-gold' : 'bg-primary',
            )}
            style={{ width: `${Math.round(m.pct * 100)}%` }}
          />
        </div>
      )}
      {m.gated && (
        <p className="mt-2 text-[10px] text-muted-foreground italic">{m.gateLabel}</p>
      )}
    </div>
  )
}
