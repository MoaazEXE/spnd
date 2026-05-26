'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/supabase/server'
import { usersRepo } from '@/data/users.repo'
import {
  getCents,
  getOptionalNumber,
  getRequiredString,
  getString,
  ValidationError,
  withValidation,
} from '@/lib/form-data'
import type { TimeCostMode } from '@/types'

export async function updateProfile(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const result = await withValidation(async () => {
    const user = await getCurrentUser()
    if (!user) throw new ValidationError('Unauthorized')

    const name = getRequiredString(formData, 'name')
    if (name.length > 60) throw new ValidationError('Name is too long (60 max).')
    await usersRepo.updateName(user.id, name)
  })

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  return typeof result === 'string' ? result : null
}

export async function saveIncomeSettings(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const result = await withValidation(async () => {
    const user = await getCurrentUser()
    if (!user) throw new ValidationError('Unauthorized')

    const monthlyIncomeCents = getCents(formData, 'monthlyIncome')
    const workingHoursPerWeek = getOptionalNumber(formData, 'weeklyHours')
    const timeCostMode = (getString(formData, 'timeCostMode') === 'TRUE_HOURLY'
      ? 'TRUE_HOURLY'
      : 'SIMPLE') as TimeCostMode

    if (monthlyIncomeCents !== null && monthlyIncomeCents <= 0) {
      throw new ValidationError('Income must be a positive number.')
    }
    if (workingHoursPerWeek !== null && workingHoursPerWeek <= 0) {
      throw new ValidationError('Working hours must be a positive number.')
    }

    await usersRepo.updateIncome(user.id, {
      monthlyIncomeCents,
      workingHoursPerWeek,
      timeCostMode,
      commuteHours: getOptionalNumber(formData, 'commuteHours'),
      workCostsCents: getCents(formData, 'workCosts'),
    })
  })

  revalidatePath('/settings')
  revalidatePath('/dashboard')
  return typeof result === 'string' ? result : null
}
