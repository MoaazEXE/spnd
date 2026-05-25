import { redirect } from 'next/navigation'
import { itemsRepo } from '@/data/items.repo'
import {
  computeSavedCents,
  computeSkipRate,
  computeThisMonthSavedCents,
  bucketSavingsByDay,
  bucketSavingsByDayRaw,
} from '@/core/savings/savings'
import { getUserContext } from '@/lib/user-context'
import { buildGreeting, buildDateLabel } from '@/lib/greeting'
import { DashboardShell } from './_components/dashboard-shell'

export default async function DashboardPage() {
  const ctx = await getUserContext()
  if (!ctx) redirect('/login')

  const [coolingItems, skippedItems, boughtItems] = await Promise.all([
    itemsRepo.findCoolingByUser(ctx.id),
    itemsRepo.findSkippedByUser(ctx.id),
    itemsRepo.findBoughtByUser(ctx.id),
  ])

  const savedCents = computeSavedCents(skippedItems)
  const thisMonthCents = computeThisMonthSavedCents(skippedItems)
  const skipRatePct = computeSkipRate(skippedItems.length, boughtItems.length)
  const savingsChartData = bucketSavingsByDay(skippedItems, 30)
  const heatmapData = bucketSavingsByDayRaw(skippedItems, 30)

  const skippedWithStatus = skippedItems.map(i => ({ ...i, status: 'SKIPPED' as const }))
  const boughtWithStatus = boughtItems.map(i => ({ ...i, status: 'BOUGHT' as const }))

  return (
    <DashboardShell
      savedCents={savedCents}
      thisMonthCents={thisMonthCents}
      skipRatePct={skipRatePct}
      coolingItems={coolingItems}
      skippedItems={skippedWithStatus}
      boughtItems={boughtWithStatus}
      timeCostContext={ctx.timeCostContext}
      savingsChartData={savingsChartData}
      heatmapData={heatmapData}
      greeting={buildGreeting(ctx.name)}
      dateLabel={buildDateLabel()}
    />
  )
}
