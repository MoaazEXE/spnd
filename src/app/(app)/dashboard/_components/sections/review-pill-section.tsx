import { itemsRepo } from '@/data/items.repo'
import { getCoolingStatus } from '@/core/cooling/coolingState'
import { ReviewPill } from '../review-pill'

export async function ReviewPillSection({ userId }: { userId: string }) {
  const items = await itemsRepo.findCoolingByUser(userId)
  const now = new Date()
  const readyCount = items.filter(
    item =>
      getCoolingStatus({ status: 'COOLING', coolingUntil: item.coolingUntil }, now) ===
      'READY_TO_RESOLVE',
  ).length
  return <ReviewPill count={readyCount} />
}
