'use server'

import { updateTag } from 'next/cache'
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
import { CURRENCIES, type CurrencyCode } from '@/lib/formatters'

const VALID_CURRENCIES: Set<string> = new Set(CURRENCIES.map(c => c.code))

export async function updateProfile(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const result = await withValidation(async () => {
    const user = await getCurrentUser()
    if (!user) throw new ValidationError('Unauthorized')

    // Guarantee the DB row exists — Google OAuth users may have a valid session
    // but no Prisma row if ensureUserRecord failed silently in the auth callback.
    const { ensureUserRecord } = await import('@/lib/ensure-user')
    await ensureUserRecord(user).catch(() => {})

    const name = getRequiredString(formData, 'name')
    if (name.length > 60) throw new ValidationError('Name is too long (60 max).')

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    // Avatar upload — uses service-role client to bypass bucket RLS on the server
    const avatarFile = formData.get('avatar')
    let avatarUrl: string | undefined
    if (avatarFile instanceof File && avatarFile.size > 0) {
      if (avatarFile.size > 2 * 1024 * 1024) throw new ValidationError('Avatar must be under 2 MB.')
      const path = `${user.id}/avatar.jpg`

      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (!serviceKey) throw new ValidationError('Storage is not configured.')
      const { createClient: createAdmin } = await import('@supabase/supabase-js')
      const adminStorage = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)

      // Remove any old avatar files before uploading
      await adminStorage.storage
        .from('avatars')
        .remove([`${user.id}/avatar.jpg`, `${user.id}/avatar.png`, `${user.id}/avatar.jpeg`, `${user.id}/avatar.webp`])
        .catch(() => {})

      const { error } = await adminStorage.storage
        .from('avatars')
        .upload(path, avatarFile, { upsert: true, contentType: 'image/jpeg' })
      if (error) throw new ValidationError(`Upload failed: ${error.message}`)

      const { data } = adminStorage.storage.from('avatars').getPublicUrl(path)
      // Append version param so browsers fetch the new image instead of serving cache
      avatarUrl = `${data.publicUrl}?v=${Date.now()}`
    }

    // Update Prisma row and Supabase user_metadata in parallel.
    // getUserContext reads name from user_metadata, so both must be in sync.
    await Promise.all([
      usersRepo.updateProfile(user.id, { name, ...(avatarUrl && { avatarUrl }) }),
      supabase.auth.updateUser({ data: { name } }),
    ])

    updateTag(`user-${user.id}`)
  }, 'action:updateProfile')

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

  updateTag(`user-${user.id}`)
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

    const currency = getString(formData, 'currency') ?? 'MYR'
    if (!VALID_CURRENCIES.has(currency)) throw new ValidationError('Invalid currency.')

    await Promise.all([
      usersRepo.updateIncome(user.id, {
        monthlyIncomeCents,
        workingHoursPerWeek,
        timeCostMode,
        commuteHours: getOptionalNumber(formData, 'commuteHours'),
        workCostsCents: getCents(formData, 'workCosts'),
      }),
      usersRepo.updateCurrency(user.id, currency as CurrencyCode),
    ])

    updateTag(`user-${user.id}`)
  })

  return typeof result === 'string' ? result : null
}
