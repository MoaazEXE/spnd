import { itemsRepo } from '@/data/items.repo'
import { groupsRepo } from '@/data/groups.repo'
import { computeMilestones } from '@/core/milestones/milestones'
import { summarizeSkipped } from '@/core/savings/savings'
import { NextMilestonePill } from '@/components/milestones/next-milestone-pill'

interface Props {
  userId: string
}

export async function NextMilestoneSection({ userId }: Props) {
  const [skipped, bought, groups] = await Promise.all([
    itemsRepo.findSkippedByUser(userId),
    itemsRepo.findBoughtByUser(userId),
    groupsRepo.findManyByUserDeep(userId),
  ])

  const { totalCents } = summarizeSkipped(skipped)
  const groupCoolingActive = groups.some(g =>
    g.expenses.some(e => e.type === 'PROPOSAL' && e.status === 'COOLING'),
  )

  const result = computeMilestones({
    skippedItems: skipped.map(i => ({
      amountCents: i.amountCents,
      coolingUntil: i.coolingUntil,
      createdAt: i.createdAt,
      resolvedAt: i.resolvedAt,
    })),
    boughtItems: bought,
    totalSavedCents: totalCents,
    groupCoolingActive,
  })

  if (!result.next) return null

  return (
    <div className="mb-4">
      <NextMilestonePill
        milestone={result.next}
        unlockedCount={result.count}
        totalCount={result.total}
      />
    </div>
  )
}
