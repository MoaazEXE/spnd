import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase/server'
import { itemsRepo } from '@/data/items.repo'
import { usersRepo } from '@/data/users.repo'
import {
  computeSavedCents,
  computeSkipRate,
  computeThisMonthSavedCents,
  bucketSavingsByDay,
  bucketSavingsByDayRaw,
} from '@/core/savings/savings'
import { DashboardShell } from './_components/dashboard-shell'
import type { TimeCostInput } from '@/types'

function buildGreeting(name: string): string {
  const hour = new Date().getHours()
  const time = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  const first = name.split(' ')[0]
  return `Good ${time}, ${first}`
}

function buildDateLabel(): string {
  return new Date().toLocaleDateString('en-MY', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const [coolingItems, skippedItems, boughtItems, dbUser] = await Promise.all([
    itemsRepo.findCoolingByUser(user.id),
    itemsRepo.findSkippedByUser(user.id),
    itemsRepo.findBoughtByUser(user.id),
    usersRepo.findById(user.id),
  ])

  const savedCents = computeSavedCents(skippedItems)
  const thisMonthCents = computeThisMonthSavedCents(skippedItems)
  const skipRatePct = computeSkipRate(skippedItems.length, boughtItems.length)
  const savingsChartData = bucketSavingsByDay(skippedItems, 30)
  const heatmapData = bucketSavingsByDayRaw(skippedItems, 30)

  const name = typeof user.user_metadata?.name === 'string'
    ? user.user_metadata.name
    : user.email?.split('@')[0] ?? ''
  const greeting = buildGreeting(name)
  const dateLabel = buildDateLabel()

  const timeCostContext: Omit<TimeCostInput, 'amountCents'> | null =
    dbUser?.monthlyIncomeCents && dbUser.workingHoursPerWeek
      ? {
          monthlyIncomeCents: dbUser.monthlyIncomeCents,
          workingHoursPerWeek: dbUser.workingHoursPerWeek,
          mode: dbUser.timeCostMode,
          commuteHours: dbUser.commuteHours ?? undefined,
          workCostsCents: dbUser.workCostsCents ?? undefined,
        }
      : null

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
      timeCostContext={timeCostContext}
      savingsChartData={savingsChartData}
      heatmapData={heatmapData}
      greeting={greeting}
      dateLabel={dateLabel}
    />
  )
}
