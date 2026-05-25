import { itemsRepo } from '@/data/items.repo'
import { groupsRepo } from '@/data/groups.repo'
import { getUserContext } from '@/lib/user-context'
import { Nav } from './nav'

/**
 * Server-side wrapper that fetches the nav-bar's badge data, then hands off
 * to the client <Nav>. Wrapped in <Suspense> at the layout level so the
 * layout itself doesn't block on these queries.
 */
export async function NavData() {
  const ctx = await getUserContext()
  if (!ctx) return null

  const [savedAgg, coolingCount, groupsCount] = await Promise.all([
    itemsRepo.sumSkippedCentsByUser(ctx.id),
    itemsRepo.countCoolingByUser(ctx.id),
    groupsRepo.countByUser(ctx.id),
  ])

  return (
    <Nav
      name={ctx.name}
      email={ctx.email}
      initial={ctx.initial}
      savedCents={savedAgg}
      coolingCount={coolingCount}
      groupsCount={groupsCount}
    />
  )
}
