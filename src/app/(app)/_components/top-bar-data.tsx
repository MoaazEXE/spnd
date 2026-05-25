import { itemsRepo } from '@/data/items.repo'
import { groupsRepo } from '@/data/groups.repo'
import { getCurrentUser } from '@/lib/supabase/server'
import { TopBar } from './top-bar'

/**
 * Server-side wrapper that fetches bell items + invites, then renders the
 * client <TopBar>. Wrapped in <Suspense> at the layout so the chrome
 * paints before this query resolves.
 */
export async function TopBarData({ initial }: { initial: string }) {
  const user = await getCurrentUser()
  if (!user) return null

  const [coolingItems, pendingInvites] = await Promise.all([
    itemsRepo.findCoolingForBellByUser(user.id),
    groupsRepo.findPendingInvitesByUser(user.id),
  ])

  const invitesForBell = pendingInvites.map(inv => ({
    groupId: inv.groupId,
    groupName: inv.group.name,
    memberCount: inv.group._count.members,
  }))

  return (
    <TopBar
      coolingItems={coolingItems}
      invites={invitesForBell}
      userInitial={initial}
    />
  )
}
