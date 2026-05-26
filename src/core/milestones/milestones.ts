export interface MilestoneInputs {
  /** All skipped items (status = SKIPPED) */
  skippedItems: Array<{ amountCents: number; coolingUntil: Date | string; createdAt?: Date | string; resolvedAt: Date | string | null }>
  /** All bought items (status = BOUGHT) */
  boughtItems: Array<{ amountCents: number }>
  /** Total cents saved across all time */
  totalSavedCents: number
  /** Whether the user is in at least one active group cooling proposal */
  groupCoolingActive: boolean
}

export interface Milestone {
  id: string
  title: string
  desc: string
  /** Raw progress value (same unit as target) */
  progress: number
  /** Target value to unlock */
  target: number
  /** Fraction 0–1 */
  pct: number
  unlocked: boolean
  /** Icon name (Lucide) */
  icon: 'Leaf' | 'Sparkles' | 'Clock' | 'TrendingUp' | 'Users' | 'CheckCircle'
  color: 'primary' | 'gold'
  /** True when a prerequisite hasn't been met — show gate label instead of progress */
  gated?: boolean
  gateLabel?: string
  unlockedAt?: Date | null
}

export interface MilestoneResult {
  all: Milestone[]
  unlocked: Milestone[]
  locked: Milestone[]
  /** The closest-to-complete non-gated locked milestone (to show as "next up") */
  next: Milestone | null
  count: number
  total: number
}

export function computeMilestones(inputs: MilestoneInputs): MilestoneResult {
  const { skippedItems, boughtItems, totalSavedCents, groupCoolingActive } = inputs

  const decisionTotal = skippedItems.length + boughtItems.length
  const skipRate = decisionTotal > 0 ? Math.round((skippedItems.length / decisionTotal) * 100) : 0

  // Longest cooling period served (coolingUntil - createdAt, in days)
  const longestCoolDays = skippedItems.length
    ? Math.max(
        0,
        ...skippedItems.map(i => {
          if (!i.createdAt) return 0
          return Math.floor((new Date(i.coolingUntil).getTime() - new Date(i.createdAt).getTime()) / 86_400_000)
        }),
      )
    : 0

  const all: Milestone[] = [
    {
      id: 'first_skip',
      title: 'First pause',
      desc: 'Skip your first temptation',
      progress: Math.min(skippedItems.length, 1),
      target: 1,
      pct: Math.min(1, skippedItems.length),
      unlocked: skippedItems.length >= 1,
      icon: 'Leaf',
      color: 'primary',
      unlockedAt: skippedItems[0]?.resolvedAt ? new Date(skippedItems[0].resolvedAt) : null,
    },
    {
      id: 'thousand',
      title: 'Four-figure club',
      desc: 'Cross RM 1,000 saved-by-waiting',
      progress: Math.min(totalSavedCents, 100_000),
      target: 100_000,
      pct: Math.min(1, totalSavedCents / 100_000),
      unlocked: totalSavedCents >= 100_000,
      icon: 'Sparkles',
      color: 'gold',
    },
    {
      id: 'patient',
      title: 'Patient one',
      desc: 'Cool on something for a full week',
      progress: Math.min(longestCoolDays, 7),
      target: 7,
      pct: Math.min(1, longestCoolDays / 7),
      unlocked: longestCoolDays >= 7,
      icon: 'Clock',
      color: 'primary',
    },
    {
      id: 'half_off',
      title: 'More than half',
      desc: 'Skip rate above 50% (5+ decisions)',
      progress: decisionTotal < 5 ? 0 : Math.min(skipRate, 50),
      target: 50,
      pct: decisionTotal < 5 ? 0 : Math.min(1, skipRate / 50),
      unlocked: decisionTotal >= 5 && skipRate >= 50,
      icon: 'TrendingUp',
      color: 'gold',
      gated: decisionTotal < 5,
      gateLabel: `${decisionTotal}/5 decisions — needs more`,
    },
    {
      id: 'group_save',
      title: 'Saved together',
      desc: 'Join a group cooling proposal',
      progress: groupCoolingActive ? 1 : 0,
      target: 1,
      pct: groupCoolingActive ? 1 : 0,
      unlocked: groupCoolingActive,
      icon: 'Users',
      color: 'primary',
    },
    {
      id: 'ten_skips',
      title: 'Ten in the bank',
      desc: 'Skip 10 temptations',
      progress: Math.min(skippedItems.length, 10),
      target: 10,
      pct: Math.min(1, skippedItems.length / 10),
      unlocked: skippedItems.length >= 10,
      icon: 'CheckCircle',
      color: 'gold',
    },
    {
      id: 'five_thousand',
      title: 'Five-figure horizon',
      desc: 'Cross RM 5,000 saved-by-waiting',
      progress: Math.min(totalSavedCents, 500_000),
      target: 500_000,
      pct: Math.min(1, totalSavedCents / 500_000),
      unlocked: totalSavedCents >= 500_000,
      icon: 'Sparkles',
      color: 'gold',
    },
  ]

  const unlocked = all.filter(m => m.unlocked)
  const locked = all.filter(m => !m.unlocked).sort((a, b) => b.pct - a.pct)
  const next = locked.find(m => !m.gated) ?? locked[0] ?? null

  return { all, unlocked, locked, next, count: unlocked.length, total: all.length }
}
