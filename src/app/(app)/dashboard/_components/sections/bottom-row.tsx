import { itemsRepo } from '@/data/items.repo'
import { groupsRepo } from '@/data/groups.repo'
import { computeBalances } from '@/core/debt/groupBalances'
import { RecentWinsResponsive } from './recent-wins-responsive'
import { GroupsMiniList, type GroupMiniRow } from '../groups-mini-list'

interface Props {
  userId: string
}

export async function BottomRow({ userId }: Props) {
  const [skipped, bought, groups] = await Promise.all([
    itemsRepo.findSkippedByUser(userId),
    itemsRepo.findBoughtByUser(userId),
    groupsRepo.findManyByUserDeep(userId),
  ])

  const groupRows: GroupMiniRow[] = groups.slice(0, 3).map(g => {
    const balances = computeBalances(g.expenses)
    return {
      id: g.id,
      name: g.name,
      memberCount: g.members.length,
      youBalanceCents: balances.get(userId) ?? 0,
    }
  })

  const skippedWithStatus = skipped.map(i => ({ ...i, status: 'SKIPPED' as const }))
  const boughtWithStatus = bought.map(i => ({ ...i, status: 'BOUGHT' as const }))

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
      <RecentWinsResponsive skippedItems={skippedWithStatus} boughtItems={boughtWithStatus} />
      <GroupsMiniList rows={groupRows} />
    </div>
  )
}
