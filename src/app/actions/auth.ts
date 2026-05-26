'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ensureUserRecord } from '@/lib/ensure-user'

export async function signIn(
  prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const email = formData.get('email')
  const password = formData.get('password')
  if (typeof email !== 'string' || typeof password !== 'string') {
    return 'Invalid form submission.'
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return error.message

  try {
    if (data.user) await ensureUserRecord(data.user)
  } catch {
    // Non-fatal: user row may already exist or will be created on next request
  }

  redirect('/dashboard')
}

export async function signUp(
  prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const name = formData.get('name')
  const email = formData.get('email')
  const password = formData.get('password')
  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string'
  ) {
    return 'Invalid form submission.'
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })
  if (error) return error.message

  // Email confirmation disabled — user is signed in immediately
  if (data.session && data.user) {
    try {
      await ensureUserRecord(data.user)
    } catch {
      // Non-fatal
    }
    redirect('/dashboard')
  }

  return 'check-email'
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function deleteAccount(): Promise<string | null> {
  try {
    const { verifyAuthUser } = await import('@/lib/supabase/server')
    const user = await verifyAuthUser()
    if (!user) return 'Not authenticated.'

    const { prisma } = await import('@/lib/prisma')
    await prisma.user.delete({ where: { id: user.id } })

    // Delete from Supabase Auth via service-role client
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (serviceKey) {
      const { createClient: createAdminClient } = await import('@supabase/supabase-js')
      const admin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceKey,
      )
      await admin.auth.admin.deleteUser(user.id)
    }

    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch (err) {
    const { logError } = await import('@/lib/log-error')
    await logError('action:deleteAccount', {}, err)
    return 'Failed to delete account. Please try again.'
  }

  redirect('/')
}
