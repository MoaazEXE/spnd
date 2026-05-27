'use client'

import { useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useLogModal } from '@/app/(app)/_components/log-modal-context'
import { useResolveSheet } from '@/app/(app)/_components/resolve-sheet-context'
import { useIsDesktop } from '@/lib/use-is-desktop'
import { getCoolingStatus } from '@/core/cooling/coolingState'
import { timeCostForItem } from '@/lib/timeCostForItem'
import { EmptyState } from '@/components/ui/empty-state'
import { CoolingCard } from '../cooling-card'
import type { TimeCostInput } from '@/types'

interface CoolingItem {
  id: string
  title: string
  amountCents: number
  coolingUntil: Date
  createdAt: Date
}

interface Props {
  items: CoolingItem[]
  timeCostContext: Omit<TimeCostInput, 'amountCents'> | null
}

export function CoolingGrid({ items, timeCostContext }: Props) {
  const log = useLogModal()
  const { optimisticItems, clearOptimistic } = log
  const resolveSheet = useResolveSheet()
  const { resolvedIds } = resolveSheet
  const isDesktop = useIsDesktop()

  // When server data refreshes, optimistic items have been persisted — clear them
  useEffect(() => { clearOptimistic() }, [items, clearOptimistic])

  // Merge: optimistic items first (instant feedback), then server items, excluding resolved
  const visibleItems = [
    ...optimisticItems.filter(o => !resolvedIds.has(o.id)),
    ...items.filter(item => !resolvedIds.has(item.id)),
  ]

  const now = new Date()
  const readyCount = visibleItems.filter(
    item =>
      getCoolingStatus({ status: 'COOLING', coolingUntil: item.coolingUntil }, now) ===
      'READY_TO_RESOLVE',
  ).length

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Cooling now
          </p>
          {visibleItems.length > 0 && (
            <p className="mt-0.5 text-xs text-subtle-foreground">
              {visibleItems.length} {visibleItems.length === 1 ? 'item' : 'items'} on pause · let time decide
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {readyCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-gold-tint text-gold-deep text-[11px] font-semibold">
              {readyCount} ready
            </span>
          )}
          <button
            type="button"
            onClick={log.open}
            className="h-9 px-3.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-primary-deep transition-colors active:scale-[0.97]"
          >
            <Plus size={14} strokeWidth={2.2} />
            Log a temptation
          </button>
        </div>
      </div>

      {visibleItems.length === 0 ? (
        <EmptyState
          icon={
            <div className="w-14 h-14 rounded-full bg-primary-tint flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="text-primary">
                <path d="M20 4c-9 0-15 5-15 12 0 2 .8 3.5 1.5 4.5 1-7 6-11 13-12-.5 7-5 12-12 13 1 .8 2.5 1.5 4.5 1.5 7 0 12-6 12-15V4h-4z" />
              </svg>
            </div>
          }
          title="Nothing cooling."
          subtitle="Tempted by something? Tap Log a temptation above."
          action={
            <button
              type="button"
              onClick={log.open}
              className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center gap-2 hover:bg-primary-deep transition-colors active:scale-[0.97]"
            >
              <Plus size={16} strokeWidth={2.2} />
              Log a temptation
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {visibleItems.map(item => (
            <CoolingCard
              key={item.id}
              item={item}
              timeCostFormatted={timeCostForItem(timeCostContext, item.amountCents)}
              onResolve={id => resolveSheet.open(id)}
              size={isDesktop ? 'lg' : 'sm'}
            />
          ))}
        </div>
      )}
    </section>
  )
}
