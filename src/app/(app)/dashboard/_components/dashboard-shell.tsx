'use client'

import { useEffect, useState } from 'react'
import { HeroSavings } from './hero-savings'
import { RecentWins } from './recent-wins'
import { SkipRateCard } from './skip-rate-card'
import { DailySavesCard } from './daily-saves-card'
import { GroupsMiniList, type GroupMiniRow } from './groups-mini-list'
import { CoolingCard } from './cooling-card'
import { ReviewPill } from './review-pill'
import { getCoolingStatus } from '@/core/cooling/coolingState'
import { useResolveSheet } from '@/app/(app)/_components/resolve-sheet-context'
import { timeCostForItem } from '@/lib/timeCostForItem'
import { EmptyState } from '@/components/ui/empty-state'
import type { TimeCostInput } from '@/types'
import type { SavingsDataPoint, DailySavingsPoint } from '@/core/savings/savings'

interface CoolingItem {
  id: string
  title: string
  amountCents: number
  coolingUntil: Date
  createdAt: Date
}

interface ResolvedItem {
  id: string
  title: string
  amountCents: number
  resolvedAt: Date | null
  status: 'SKIPPED' | 'BOUGHT'
}

interface Props {
  savedCents: number
  thisMonthCents: number
  skipRatePct: number
  coolingItems: CoolingItem[]
  skippedItems: ResolvedItem[]
  boughtItems: ResolvedItem[]
  timeCostContext: Omit<TimeCostInput, 'amountCents'> | null
  savingsChartData: SavingsDataPoint[]
  heatmapData: DailySavingsPoint[]
  greeting: string
  dateLabel: string
  groupRows: GroupMiniRow[]
}

export function DashboardShell({
  savedCents,
  thisMonthCents,
  skipRatePct,
  coolingItems,
  skippedItems,
  boughtItems,
  timeCostContext,
  savingsChartData,
  heatmapData,
  greeting,
  dateLabel,
  groupRows,
}: Props) {
  const resolveSheet = useResolveSheet()
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setIsDesktop(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const heroTimeCost =
    timeCostContext && savedCents > 0 ? timeCostForItem(timeCostContext, savedCents) : undefined

  const now = new Date()
  const readyCount = coolingItems.filter(
    item =>
      getCoolingStatus({ status: 'COOLING', coolingUntil: item.coolingUntil }, now) ===
      'READY_TO_RESOLVE',
  ).length

  return (
    <div className="max-w-[520px] lg:max-w-[1080px] mx-auto px-5 lg:px-12 pt-6 lg:pt-8 pb-8 lg:pb-16">
      {/* Greeting */}
      <div className="mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {dateLabel}
          </p>
          <h1 className="mt-0.5 font-display text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
            {greeting}
          </h1>
        </div>
        <ReviewPill count={readyCount} />
      </div>

      {/* Hero row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
        <HeroSavings
          savedCents={savedCents}
          thisMonthCents={thisMonthCents}
          timeCostFormatted={heroTimeCost}
          sparkData={savingsChartData}
        />
        <div className="flex flex-col gap-4">
          <SkipRateCard pct={skipRatePct} />
          <DailySavesCard data={heatmapData} />
        </div>
      </div>

      {/* Cooling now */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Cooling now
            </p>
            {coolingItems.length > 0 && (
              <p className="mt-0.5 text-xs text-subtle-foreground">
                {coolingItems.length} {coolingItems.length === 1 ? 'item' : 'items'} on pause · let
                time decide
              </p>
            )}
          </div>
          {readyCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-gold-tint text-gold-deep text-[11px] font-semibold">
              {readyCount} ready
            </span>
          )}
        </div>

        {coolingItems.length === 0 ? (
          <EmptyState
            icon={
              <div className="w-14 h-14 rounded-full bg-primary-tint flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="text-primary">
                  <path d="M20 4c-9 0-15 5-15 12 0 2 .8 3.5 1.5 4.5 1-7 6-11 13-12-.5 7-5 12-12 13 1 .8 2.5 1.5 4.5 1.5 7 0 12-6 12-15V4h-4z" />
                </svg>
              </div>
            }
            title="Nothing cooling."
            subtitle="Tempted by something? Use the “Log temptation” button up top."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {coolingItems.map(item => (
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

      {/* Bottom row */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentWins
          skippedItems={skippedItems}
          boughtItems={boughtItems}
          maxItems={isDesktop ? 5 : 3}
        />
        <GroupsMiniList rows={groupRows} />
      </div>
    </div>
  )
}
