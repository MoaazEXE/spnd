import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { itemsRepo } from '@/data/items.repo'
import { usersRepo } from '@/data/users.repo'
import { computeSavedCents, bucketSavingsByDay } from '@/core/savings/savings'
import { DashboardShell } from './_components/dashboard-shell'
import type { TimeCostInput } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [allItems, skippedItems, dbUser] = await Promise.all([
    itemsRepo.findManyByUser(user.id),
    itemsRepo.findSkippedByUser(user.id),
    usersRepo.findById(user.id),
  ])

  const coolingItems = allItems.filter(i => i.status === 'COOLING')
  const savedCents = computeSavedCents(skippedItems)
  const savingsChartData = bucketSavingsByDay(skippedItems, 14)

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

  return (
    <DashboardShell
      savedCents={savedCents}
      coolingItems={coolingItems}
      skippedItems={skippedItems}
      defaultCoolingPeriod={dbUser?.defaultCoolingPeriod ?? '1d'}
      timeCostContext={timeCostContext}
      savingsChartData={savingsChartData}
    />
  )
}
