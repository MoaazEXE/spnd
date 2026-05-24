'use client'

import { useEffect, useState } from 'react'
import { HeroSavings } from './hero-savings'
import { RecentWins } from './recent-wins'
import { SkipRateCard } from './skip-rate-card'
import { DailySavesCard } from './daily-saves-card'
import { GroupsMiniList } from './groups-mini-list'
import { CoolingCard } from './cooling-card'
import { ReviewPill } from './review-pill'
import { getCoolingStatus } from '@/core/cooling/coolingState'
import { useResolveSheet } from '@/app/(app)/_components/resolve-sheet-context'
import { timeCostForItem } from '@/lib/timeCostForItem'
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
}

export function DashboardShell({
  savedCents, thisMonthCents, skipRatePct,
  coolingItems, skippedItems, boughtItems,
  timeCostContext,
  savingsChartData, heatmapData, greeting, dateLabel,
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
    item => getCoolingStatus({ status: 'COOLING', coolingUntil: item.coolingUntil }, now) === 'READY_TO_RESOLVE'
  ).length

  return (
    <div className="max-w-[520px] lg:max-w-[1080px] mx-auto pb-8 lg:pb-16 px-5 lg:px-12 pt-6 lg:pt-8">
      {/* ── Greeting strip ── */}
      <div className="flex items-start lg:items-center justify-between gap-3 flex-col lg:flex-row mb-6">
        <div>
          <p className="text-[12px] font-medium text-[var(--text-muted)] uppercase tracking-[0.4px]">{dateLabel}</p>
          <h1 className="text-[26px] lg:text-[34px] font-semibold text-foreground tracking-[-0.6px] mt-0.5" style={{ fontFamily: 'var(--font-fraunces, inherit)' }}>
            {greeting}
          </h1>
        </div>
        <ReviewPill count={readyCount} />
      </div>

      {/* ── Hero grid: hero (1.6fr) | stacked right column (1fr) ── */}
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

      {/* ── Cooling Now ── */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.2px] text-[var(--text-muted)]">
              Cooling now
            </p>
            {coolingItems.length > 0 && (
              <p className="text-[12px] text-[var(--text-subtle)] mt-0.5">
                {coolingItems.length} {coolingItems.length === 1 ? 'item on pause' : 'items on pause'} · let time decide
              </p>
            )}
          </div>
          {readyCount > 0 && (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[var(--gold-tint)] text-[var(--gold-deep)]">
              {readyCount} ready
            </span>
          )}
        </div>

        {coolingItems.length === 0 ? (
          <div className="rounded-[20px] bg-card py-10 px-5 text-center shadow-[0_1px_2px_rgba(31,42,46,0.04),0_4px_16px_rgba(31,42,46,0.04)]">
            <div className="w-14 h-14 rounded-full bg-[var(--primary-tint)] flex items-center justify-center mx-auto mb-3">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#2D5F5B" aria-hidden="true">
                <path d="M20 4c-9 0-15 5-15 12 0 2 .8 3.5 1.5 4.5 1-7 6-11 13-12-.5 7-5 12-12 13 1 .8 2.5 1.5 4.5 1.5 7 0 12-6 12-15V4h-4z" />
              </svg>
            </div>
            <p className="text-[16px] font-semibold text-foreground">Nothing cooling.</p>
            <p className="text-[14px] text-[var(--text-muted)] mt-1.5 leading-relaxed">
              Tempted by something? Use the &ldquo;Log temptation&rdquo; button up top.
            </p>
          </div>
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

      {/* ── Bottom row: Recent wins + Your groups ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
        <RecentWins skippedItems={skippedItems} boughtItems={boughtItems} maxItems={isDesktop ? 5 : 3} />
        <GroupsMiniList />
      </div>
    </div>
  )
}
