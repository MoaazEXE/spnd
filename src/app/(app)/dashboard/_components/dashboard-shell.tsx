'use client'

import { useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { CoolingCard } from './cooling-card'
import { LogSheet } from './log-sheet'
import { ResolveSheet } from './resolve-sheet'
import { CelebrationOverlay } from './celebration-overlay'
import { HeroSavings } from './hero-savings'
import { RecentWins } from './recent-wins'
import { calculateTimeCost } from '@/core/timecost/timeCost'
import type { TimeCostInput } from '@/types'

interface CoolingItem {
  id: string
  title: string
  amountCents: number
  coolingUntil: Date
  createdAt: Date
}

interface SkippedItem {
  id: string
  title: string
  amountCents: number
  resolvedAt: Date | null
}

interface Props {
  savedCents: number
  coolingItems: CoolingItem[]
  skippedItems: SkippedItem[]
  defaultCoolingPeriod: string
  timeCostContext: Omit<TimeCostInput, 'amountCents'> | null
}

interface Celebration {
  amountCents: number
  timeCostFormatted?: string
}

export function DashboardShell({
  savedCents,
  coolingItems,
  skippedItems,
  defaultCoolingPeriod,
  timeCostContext,
}: Props) {
  const [logOpen, setLogOpen] = useState(false)
  const [resolveItemId, setResolveItemId] = useState<string | null>(null)
  const [celebration, setCelebration] = useState<Celebration | null>(null)

  const resolveItem = coolingItems.find(i => i.id === resolveItemId) ?? null

  const handleSkipped = useCallback((amountCents: number, timeCostFormatted?: string) => {
    setCelebration({ amountCents, timeCostFormatted })
  }, [])

  function getTimeCostForItem(amountCents: number): string | undefined {
    if (!timeCostContext) return undefined
    const result = calculateTimeCost({ ...timeCostContext, amountCents })
    return result.hours > 0 ? result.formatted : undefined
  }

  const heroTimeCost =
    timeCostContext && savedCents > 0
      ? getTimeCostForItem(savedCents)
      : undefined

  return (
    <>
      <div className="pb-32">
        {/* Hero */}
        <HeroSavings savedCents={savedCents} timeCostFormatted={heroTimeCost} />

        {/* Cooling Now */}
        <section className="px-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.4px] text-muted-foreground">
              Cooling now
            </p>
            {coolingItems.length > 0 && (
              <span className="text-[12px] font-semibold text-muted-foreground">
                {coolingItems.length}
              </span>
            )}
          </div>

          {coolingItems.length === 0 ? (
            <div className="py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🌿</span>
              </div>
              <p className="text-[14px] font-medium text-muted-foreground">Nothing cooling.</p>
              <p className="text-[13px] text-muted-foreground/70 mt-1">Tempted by something? Log it.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {coolingItems.map(item => (
                <CoolingCard
                  key={item.id}
                  item={item}
                  timeCostFormatted={getTimeCostForItem(item.amountCents)}
                  onResolve={id => setResolveItemId(id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Recent wins */}
        <RecentWins items={skippedItems} />
      </div>

      {/* FAB */}
      <button
        onClick={() => setLogOpen(true)}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_6px_20px_rgba(45,95,91,0.32)] transition-transform active:scale-[0.94] hover:bg-primary/90 z-30"
        aria-label="Log a temptation"
      >
        <Plus size={28} strokeWidth={2} />
      </button>

      {/* Log sheet */}
      {logOpen && (
        <LogSheet
          onClose={() => setLogOpen(false)}
          defaultCoolingPeriod={defaultCoolingPeriod}
          timeCostContext={timeCostContext}
        />
      )}

      {/* Resolve sheet */}
      {resolveItem && (
        <ResolveSheet
          item={{
            ...resolveItem,
            timeCostFormatted: getTimeCostForItem(resolveItem.amountCents),
          }}
          onClose={() => setResolveItemId(null)}
          onSkipped={handleSkipped}
        />
      )}

      {/* Celebration overlay */}
      {celebration && (
        <CelebrationOverlay
          amountCents={celebration.amountCents}
          timeCostFormatted={celebration.timeCostFormatted}
          onDone={() => setCelebration(null)}
        />
      )}
    </>
  )
}
