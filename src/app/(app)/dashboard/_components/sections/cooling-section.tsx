import { itemsRepo } from '@/data/items.repo'
import { CoolingGrid } from './cooling-grid'
import type { TimeCostInput } from '@/types'

interface Props {
  userId: string
  timeCostContext: Omit<TimeCostInput, 'amountCents'> | null
}

export async function CoolingSection({ userId, timeCostContext }: Props) {
  const items = await itemsRepo.findCoolingByUser(userId)
  return <CoolingGrid items={items} timeCostContext={timeCostContext} />
}
