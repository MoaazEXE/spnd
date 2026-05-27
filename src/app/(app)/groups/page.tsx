import { redirect } from 'next/navigation'
import { groupsRepo } from '@/data/groups.repo'
import { getUserContext } from '@/lib/user-context'
import { computeBalances } from '@/core/debt/groupBalances'
import { GroupsListShell } from './_components/groups-list-shell'

export interface GroupSummary {
  id: string
  name: string
  memberCount: number
  guestCount: number
  members: { id: string; name: string; avatarUrl: string | null }[]
  guests: { id: string; name: string }[]
  youOweCents: number
  savedTogetherCents: number
}

export interface InvitePreview {
  groupId: string
  groupName: string
  memberCount: number
}

/**
 * Serialized group shape passed to the client-side GroupsListShell.
 * All Date fields are pre-converted to ISO strings so the client component
 * receives correct types without relying on RSC Date serialization.
 */
export interface RawGroupForShell {
  id: string
  name: string
  createdBy: string
  members: {
    userId: string
    joinedAt: string
    user: { id: string; name: string; avatarUrl: string | null }
  }[]
  guestMembers: { id: string; name: string; addedBy: string; createdAt: string }[]
  expenses: {
    id: string
    payerId: string
    amountCents: number
    description: string
    createdAt: string
    shares: { userId: string; shareCents: number }[]
    guestShares: { shareCents: number; guest: { addedBy: string; name: string } }[]
    payer: { id: string; name: string; avatarUrl: string | null }
  }[]
  items: { amountCents: number }[]
}

export default async function GroupsPage() {
  const ctx = await getUserContext()
  if (!ctx) redirect('/login')

  // Single DB round-trip: findManyByUserDeep fetches everything needed,
  // including full expense/member/share data for the right-panel detail view.
  const [groups, pendingInvites] = await Promise.all([
    groupsRepo.findManyByUserDeep(ctx.id),
    groupsRepo.findPendingInvitesByUser(ctx.id),
  ])

  const invites: InvitePreview[] = pendingInvites.map(inv => ({
    groupId: inv.groupId,
    groupName: inv.group.name,
    memberCount: inv.group._count.members,
  }))

  const summaries: GroupSummary[] = groups.map(g => {
    const balances = computeBalances(g.expenses)
    const savedTogetherCents = g.items.reduce((sum, i) => sum + i.amountCents, 0)
    return {
      id: g.id,
      name: g.name,
      memberCount: g.members.length,
      guestCount: g.guestMembers.length,
      members: g.members.map(m => ({ id: m.user.id, name: m.user.name, avatarUrl: m.user.avatarUrl })),
      guests: g.guestMembers.map(gm => ({ id: gm.id, name: gm.name })),
      youOweCents: balances.get(ctx.id) ?? 0,
      savedTogetherCents,
    }
  })

  const totalSavedCents = summaries.reduce((sum, s) => sum + s.savedTogetherCents, 0)

  // Pre-serialize Date fields so the client component receives plain strings.
  const allGroupsRaw: RawGroupForShell[] = groups.map(g => ({
    id: g.id,
    name: g.name,
    createdBy: g.createdBy,
    members: g.members.map(m => ({
      userId: m.userId,
      joinedAt: new Date(m.joinedAt).toISOString(),
      user: { id: m.user.id, name: m.user.name, avatarUrl: m.user.avatarUrl },
    })),
    guestMembers: g.guestMembers.map(gm => ({
      id: gm.id,
      name: gm.name,
      addedBy: gm.addedBy,
      createdAt: new Date(gm.createdAt).toISOString(),
    })),
    expenses: g.expenses.map(e => ({
      id: e.id,
      payerId: e.payerId,
      amountCents: e.amountCents,
      description: e.description,
      createdAt: new Date(e.createdAt).toISOString(),
      shares: e.shares.map(s => ({ userId: s.userId, shareCents: s.shareCents })),
      guestShares: (e.guestShares ?? []).map(gs => ({
        shareCents: gs.shareCents,
        guest: { addedBy: gs.guest.addedBy, name: gs.guest.name },
      })),
      payer: { id: e.payer.id, name: e.payer.name, avatarUrl: e.payer.avatarUrl },
    })),
    items: g.items.map(i => ({ amountCents: i.amountCents })),
  }))

  return (
    <GroupsListShell
      groups={summaries}
      invites={invites}
      totalSavedCents={totalSavedCents}
      currentUserId={ctx.id}
      allGroupsRaw={allGroupsRaw}
    />
  )
}
