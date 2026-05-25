import { redirect } from 'next/navigation'
import { itemsRepo } from '@/data/items.repo'
import { groupsRepo } from '@/data/groups.repo'
import {
  computeSavedCents,
  computeSkipRate,
  computeThisMonthSavedCents,
  bucketSavingsByDay,
  bucketSavingsByDayRaw,
} from '@/core/savings/savings'
import { computeBalances } from '@/core/debt/groupBalances'
import { getUserContext } from '@/lib/user-context'
import { buildGreeting, buildDateLabel } from '@/lib/greeting'
import { DashboardShell } from './_components/dashboard-shell'
import type { GroupMiniRow } from './_components/groups-mini-list'

export default async function DashboardPage() {
  const ctx = await getUserContext()
  if (!ctx) redirect('/login')

  const [coolingItems, skippedItems, boughtItems, groups] = await Promise.all([
    itemsRepo.findCoolingByUser(ctx.id),
    itemsRepo.findSkippedByUser(ctx.id),
    itemsRepo.findBoughtByUser(ctx.id),
    groupsRepo.findManyByUserDeep(ctx.id),
  ])

  const groupRows: GroupMiniRow[] = groups.slice(0, 3).map(g => {
    const balances = computeBalances(g.expenses)
    return {
      id: g.id,
      name: g.name,
      memberCount: g.members.length,
      youBalanceCents: balances.get(ctx.id) ?? 0,
    }
  })

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
      groupRows={groupRows}
    />
  )
}
