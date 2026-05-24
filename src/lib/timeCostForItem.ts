import { calculateTimeCost } from '@/core/timecost/timeCost'
import type { TimeCostInput } from '@/types'

/**
 * Convenience: returns the formatted time-cost label for an amount given a
 * user's time-cost context, or undefined when the user hasn't filled in
 * income/hours yet or the result rounds to zero hours.
 */
export function timeCostForItem(
  ctx: Omit<TimeCostInput, 'amountCents'> | null,
  amountCents: number,
): string | undefined {
  if (!ctx) return undefined
  const result = calculateTimeCost({ ...ctx, amountCents })
  return result.hours > 0 ? result.formatted : undefined
}
