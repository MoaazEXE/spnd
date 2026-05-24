// Cooling state machine — status is always computed from timestamps, never from a client timer
import type { ComputedItemStatus, ItemStatus, CoolingUnit } from '@/types'

interface CoolableItem {
  status: ItemStatus
  coolingUntil: Date | null
}

export function getCoolingStatus(
  item: CoolableItem,
  now = new Date()
): ComputedItemStatus {
  if (item.status !== 'COOLING') return item.status
  if (!item.coolingUntil) return 'READY_TO_RESOLVE'
  return item.coolingUntil > now ? 'COOLING' : 'READY_TO_RESOLVE'
}

export function computeCoolingUntil(
  from: Date,
  value: number,
  unit: CoolingUnit
): Date {
  const ms =
    unit === 'MINUTES' ? value * 60 * 1000 :
    unit === 'HOURS'   ? value * 60 * 60 * 1000 :
    unit === 'DAYS'    ? value * 24 * 60 * 60 * 1000 :
                         value * 7 * 24 * 60 * 60 * 1000
  return new Date(from.getTime() + ms)
}

export function getRemainingMs(coolingUntil: Date, now = new Date()): number {
  return Math.max(0, coolingUntil.getTime() - now.getTime())
}
