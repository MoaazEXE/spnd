import { cache } from 'react'
import { getCurrentUser } from '@/lib/supabase/server'
import { usersRepo } from '@/data/users.repo'
import type { TimeCostInput } from '@/types'

export type TimeCostContext = Omit<TimeCostInput, 'amountCents'>

export interface UserContext {
  id: string
  name: string
  email: string
  initial: string
  defaultCoolingPeriod: string
  timeCostContext: TimeCostContext | null
}

/**
 * Per-request cached identity + DB profile. Combines Supabase JWT claims and
 * the Prisma user row so every consumer in a single render gets one read.
 */
export const getUserContext = cache(async (): Promise<UserContext | null> => {
  const authUser = await getCurrentUser()
  if (!authUser) return null

  const dbUser = await usersRepo.findById(authUser.id)
  const metadataName =
    typeof authUser.user_metadata?.name === 'string'
      ? (authUser.user_metadata.name as string)
      : null
  const name = metadataName ?? authUser.email?.split('@')[0] ?? 'You'

  const timeCostContext: TimeCostContext | null =
    dbUser?.monthlyIncomeCents && dbUser.workingHoursPerWeek
      ? {
          monthlyIncomeCents: dbUser.monthlyIncomeCents,
          workingHoursPerWeek: dbUser.workingHoursPerWeek,
          mode: dbUser.timeCostMode,
          commuteHours: dbUser.commuteHours ?? undefined,
          workCostsCents: dbUser.workCostsCents ?? undefined,
        }
      : null

  return {
    id: authUser.id,
    name,
    email: authUser.email ?? '',
    initial: (name || '?').charAt(0).toUpperCase(),
    defaultCoolingPeriod: dbUser?.defaultCoolingPeriod ?? '1d',
    timeCostContext,
  }
})
