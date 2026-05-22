import type { User } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

/**
 * Upsert a User row using the Supabase auth UUID as the primary key.
 * Called after every successful auth event (sign-up, sign-in, OAuth callback).
 * The DB trigger handles this for email-confirmation flows, but we call it
 * explicitly here as a reliable fallback for all other paths.
 */
export async function ensureUserRecord(user: User): Promise<void> {
  const name =
    typeof user.user_metadata?.name === 'string'
      ? user.user_metadata.name
      : user.email?.split('@')[0] ?? 'User'

  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: { id: user.id, name, email: user.email ?? '' },
  })
}
