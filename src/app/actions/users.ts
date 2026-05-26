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

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    // Avatar upload — stored in Supabase Storage bucket "avatars"
    const avatarFile = formData.get('avatar')
    let avatarUrl: string | undefined
    if (avatarFile instanceof File && avatarFile.size > 0) {
      if (avatarFile.size > 2 * 1024 * 1024) throw new ValidationError('Avatar must be under 2 MB.')
      const ext = avatarFile.name.split('.').pop() ?? 'jpg'
      const path = `${user.id}/avatar.${ext}`
      const { error } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type })
      if (!error) {
        const { data } = supabase.storage.from('avatars').getPublicUrl(path)
        avatarUrl = data.publicUrl
      }
    }

    // Update Prisma row and Supabase user_metadata in parallel.
    // getUserContext reads name from user_metadata, so both must be in sync.
    await Promise.all([
      usersRepo.updateProfile(user.id, { name, ...(avatarUrl && { avatarUrl }) }),
      supabase.auth.updateUser({ data: { name } }),
    ])
  }, 'action:updateProfile')

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  return typeof result === 'string' ? result : null
}

export async function updateNotificationPrefs(formData: FormData): Promise<void> {
  const user = await getCurrentUser()
  if (!user) return

  await usersRepo.updateNotificationPrefs(user.id, {
    notifyCoolingReady: formData.get('notifyCoolingReady') === '1',
    notifyGroupActivity: formData.get('notifyGroupActivity') === '1',
    notifyMilestoneUnlocked: formData.get('notifyMilestoneUnlocked') === '1',
  })

  revalidatePath('/profile')
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
