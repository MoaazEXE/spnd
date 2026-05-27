import { itemsRepo } from '@/data/items.repo'
import { groupsRepo } from '@/data/groups.repo'
import { usersRepo } from '@/data/users.repo'
import { getCurrentUser } from '@/lib/supabase/server'
import { TopBar } from './top-bar'

/**
 * Server-side wrapper that fetches bell items + invites + user notification
 * prefs, then renders the client <TopBar>. Wrapped in <Suspense> at the
 * layout so the chrome paints before this query resolves.
 */
export async function TopBarData({ initial }: { initial: string }) {
  const user = await getCurrentUser()
  if (!user) return null

  const [coolingItems, pendingInvites, dbUser, recentGroupExpenses] = await Promise.all([
    itemsRepo.findCoolingForBellByUser(user.id),
    groupsRepo.findPendingInvitesByUser(user.id),
    usersRepo.findById(user.id),
    groupsRepo.findRecentGroupExpensesByOthers(user.id),
  ])

  const notifyCooling = dbUser?.notifyCoolingReady ?? true
  const notifyGroup = dbUser?.notifyGroupActivity ?? true

  const invitesForBell = notifyGroup
    ? pendingInvites.map(inv => ({
        groupId: inv.groupId,
        groupName: inv.group.name,
        memberCount: inv.group._count.members,
      }))
    : []

  const groupExpensesForBell = notifyGroup
    ? recentGroupExpenses.map(e => ({
        id: e.id,
        description: e.description,
        amountCents: e.amountCents,
        payerName: e.payer.name,
        groupId: e.groupId,
        groupName: e.group.name,
        createdAt: e.createdAt,
      }))
    : []

  return (
    <TopBar
      coolingItems={notifyCooling ? coolingItems : []}
      invites={invitesForBell}
      groupExpenses={groupExpensesForBell}
      userInitial={initial}
      userAvatarUrl={dbUser?.avatarUrl}
    />
  )
}
