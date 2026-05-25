import { redirect } from 'next/navigation'
import { groupsRepo } from '@/data/groups.repo'
import { getUserContext } from '@/lib/user-context'
import { computeBalances } from '@/core/debt/groupBalances'
import { GroupsListShell } from './_components/groups-list-shell'

export interface GroupSummary {
  id: string
  name: string
  memberCount: number
  members: { id: string; name: string }[]
  youOweCents: number
  savedTogetherCents: number
}

export default async function GroupsPage() {
  const ctx = await getUserContext()
  if (!ctx) redirect('/login')

  const groups = await groupsRepo.findManyByUserDeep(ctx.id)

  const summaries: GroupSummary[] = groups.map(g => {
    const balances = computeBalances(g.expenses)
    const savedTogetherCents = g.items.reduce((sum, i) => sum + i.amountCents, 0)
    return {
      id: g.id,
      name: g.name,
      memberCount: g.members.length,
      members: g.members.map(m => ({ id: m.user.id, name: m.user.name })),
      youOweCents: balances.get(ctx.id) ?? 0,
      savedTogetherCents,
    }
  })

  const totalSavedCents = summaries.reduce((sum, s) => sum + s.savedTogetherCents, 0)

  return (
    <GroupsListShell
      groups={summaries}
      totalSavedCents={totalSavedCents}
      currentUserId={ctx.id}
    />
  )
}
