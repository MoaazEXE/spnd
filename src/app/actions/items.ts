'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { itemsRepo } from '@/data/items.repo'
import { usersRepo } from '@/data/users.repo'
import { computeCoolingUntil } from '@/core/cooling/coolingState'
import type { CoolingUnit } from '@/types'

async function getAuthUserId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user.id
}

export async function logItem(
  prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const title = formData.get('title')
  const amountRaw = formData.get('amount')
  const coolingValue = formData.get('coolingValue')
  const coolingUnit = formData.get('coolingUnit')
  const note = formData.get('note')

  if (typeof title !== 'string' || !title.trim()) return 'Name is required.'
  if (typeof amountRaw !== 'string') return 'Amount is required.'
  if (typeof coolingValue !== 'string' || typeof coolingUnit !== 'string') return 'Cooling period is required.'

  const amountCents = Math.round(parseFloat(amountRaw) * 100)
  if (!Number.isFinite(amountCents) || amountCents <= 0) return 'Enter a valid amount.'

  const userId = await getAuthUserId()
  const coolingUntil = computeCoolingUntil(
    new Date(),
    parseInt(coolingValue, 10),
    coolingUnit as CoolingUnit,
  )

  await itemsRepo.create({
    userId,
    title: title.trim(),
    amountCents,
    coolingUntil,
    note: typeof note === 'string' && note.trim() ? note.trim() : undefined,
  })

  // Remember last used cooling period as the new default
  await usersRepo.updateDefaultCoolingPeriod(
    userId,
    `${coolingValue}${coolingUnit === 'HOURS' ? 'h' : coolingUnit === 'DAYS' ? 'd' : 'w'}`,
  )

  revalidatePath('/dashboard')
  return null
}

export async function resolveItem(id: string, outcome: 'BOUGHT' | 'SKIPPED') {
  const userId = await getAuthUserId()
  await itemsRepo.resolve(id, userId, outcome)
  revalidatePath('/dashboard')
}

export async function snoozeItem(id: string) {
  const userId = await getAuthUserId()
  await itemsRepo.snooze(id, userId)
  revalidatePath('/dashboard')
}
