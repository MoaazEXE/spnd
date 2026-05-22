'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { usersRepo } from '@/data/users.repo'
import type { TimeCostMode } from '@/types'

async function getAuthUserId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user.id
}

export async function saveIncomeSettings(
  prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const monthlyIncomeRaw = formData.get('monthlyIncome')
  const weeklyHoursRaw = formData.get('weeklyHours')
  const timeCostMode = formData.get('timeCostMode')
  const commuteHoursRaw = formData.get('commuteHours')
  const workCostsRaw = formData.get('workCosts')

  const monthlyIncomeCents =
    typeof monthlyIncomeRaw === 'string' && monthlyIncomeRaw
      ? Math.round(parseFloat(monthlyIncomeRaw) * 100)
      : null

  const workingHoursPerWeek =
    typeof weeklyHoursRaw === 'string' && weeklyHoursRaw
      ? parseFloat(weeklyHoursRaw)
      : null

  if (monthlyIncomeCents !== null && monthlyIncomeCents <= 0) {
    return 'Income must be a positive number.'
  }
  if (workingHoursPerWeek !== null && workingHoursPerWeek <= 0) {
    return 'Working hours must be a positive number.'
  }

  const userId = await getAuthUserId()
  await usersRepo.updateIncome(userId, {
    monthlyIncomeCents,
    workingHoursPerWeek,
    timeCostMode: (timeCostMode === 'TRUE_HOURLY' ? 'TRUE_HOURLY' : 'SIMPLE') as TimeCostMode,
    commuteHours:
      typeof commuteHoursRaw === 'string' && commuteHoursRaw
        ? parseFloat(commuteHoursRaw)
        : null,
    workCostsCents:
      typeof workCostsRaw === 'string' && workCostsRaw
        ? Math.round(parseFloat(workCostsRaw) * 100)
        : null,
  })

  revalidatePath('/settings')
  revalidatePath('/dashboard')
  return null
}
