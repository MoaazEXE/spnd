import { redirect } from 'next/navigation'
import { getUserContext } from '@/lib/user-context'
import { usersRepo } from '@/data/users.repo'
import { itemsRepo } from '@/data/items.repo'
import { groupsRepo } from '@/data/groups.repo'
import { computeSkipRate, summarizeSkipped } from '@/core/savings/savings'
import { ProfileShell } from './_components/profile-shell'

export default async function ProfilePage() {
  const ctx = await getUserContext()
  if (!ctx) redirect('/login')

  const [coolingItems, skippedItems, boughtItems, groups] = await Promise.all([
    itemsRepo.findCoolingByUser(ctx.id),
    itemsRepo.findSkippedByUser(ctx.id),
    itemsRepo.findBoughtByUser(ctx.id),
    groupsRepo.findManyByUserDeep(ctx.id),
  ])

  const dbUser = await usersRepo.findById(ctx.id)

  const summary = summarizeSkipped(skippedItems, 30)
  const skipRatePct = computeSkipRate(skippedItems.length, boughtItems.length)

  // Personal records
  const biggestSaveCents = skippedItems.length > 0
    ? Math.max(...skippedItems.map(i => i.amountCents))
    : 0
  const biggestSaveTitle = skippedItems.find(i => i.amountCents === biggestSaveCents)?.title ?? '—'
  const avgSaveCents = skippedItems.length > 0
    ? Math.round(skippedItems.reduce((s, i) => s + i.amountCents, 0) / skippedItems.length)
    : 0

  // Recent activity (last 5 resolved items)
  const recentActivity = [
    ...skippedItems.map(i => ({ ...i, status: 'SKIPPED' as const })),
    ...boughtItems.map(i => ({ ...i, status: 'BOUGHT' as const })),
  ]
    .filter(i => i.resolvedAt)
    .sort((a, b) => (b.resolvedAt?.getTime() ?? 0) - (a.resolvedAt?.getTime() ?? 0))
    .slice(0, 5)

  // Compute hourly wage for the "hours reclaimed" stat
  const hourlyWageCents = dbUser?.monthlyIncomeCents && dbUser.workingHoursPerWeek
    ? dbUser.monthlyIncomeCents / (dbUser.workingHoursPerWeek * 4.33)
    : null
  const lifeHours = hourlyWageCents ? summary.totalCents / hourlyWageCents : null

  return (
    <ProfileShell
      name={ctx.name}
      email={ctx.email}
      initial={ctx.initial}
      memberSince={dbUser?.createdAt ? new Date(dbUser.createdAt) : new Date()}
      savedCents={summary.totalCents}
      skippedCount={skippedItems.length}
      boughtCount={boughtItems.length}
      coolingCount={coolingItems.length}
      skipRatePct={skipRatePct}
      groupsCount={groups.length}
      biggestSaveCents={biggestSaveCents}
      biggestSaveTitle={biggestSaveTitle}
      avgSaveCents={avgSaveCents}
      lifeHours={lifeHours}
      recentActivity={recentActivity.map(i => ({
        id: i.id,
        title: i.title,
        amountCents: i.amountCents,
        status: i.status,
        resolvedAt: i.resolvedAt!,
      }))}
    />
  )
}
