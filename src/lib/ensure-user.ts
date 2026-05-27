import { prisma } from '@/lib/prisma'

const SAFE_AVATAR_HOSTS = new Set([
  'lh3.googleusercontent.com',
  'avatars.githubusercontent.com',
])

function isSafeAvatarUrl(url: string | undefined): url is string {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && SAFE_AVATAR_HOSTS.has(parsed.hostname)
  } catch {
    return false
  }
}

interface MinimalAuthUser {
  id: string
  email?: string | null
  user_metadata?: Record<string, unknown> | null
}

/**
 * Upsert a User row using the Supabase auth UUID as the primary key.
 * Called after auth events and on first write per session as a reliable fallback.
 */
export async function ensureUserRecord(user: MinimalAuthUser): Promise<void> {
  // Google OAuth uses full_name; email/password signup uses name
  const metadataName =
    user.user_metadata && (
      (typeof user.user_metadata.full_name === 'string' ? user.user_metadata.full_name : null) ??
      (typeof user.user_metadata.name === 'string' ? user.user_metadata.name : null)
    )
  const name = metadataName ?? user.email?.split('@')[0] ?? 'User'

  // Google OAuth exposes the profile picture as avatar_url (Supabase-mapped) or picture (raw)
  const rawAvatarUrl =
    user.user_metadata
      ? ((typeof user.user_metadata.avatar_url === 'string' && user.user_metadata.avatar_url) ||
         (typeof user.user_metadata.picture === 'string' && user.user_metadata.picture) ||
         undefined)
      : undefined
  const googleAvatarUrl = isSafeAvatarUrl(rawAvatarUrl) ? rawAvatarUrl : undefined

  try {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        name,
        email: user.email ?? '',
        ...(googleAvatarUrl && { avatarUrl: googleAvatarUrl }),
      },
    })
  } catch (e) {
    const code = (e as { code?: string })?.code
    if (code === 'P2002') {
      // Email exists under a different auth UUID (e.g. email signup → Google OAuth).
      // Group.createdBy and Expense.payerId have no cascade, so clean those up first.
      const staleUsers = await prisma.user.findMany({
        where: { email: user.email ?? '' },
        select: { id: true },
      })
      for (const stale of staleUsers) {
        await prisma.group.deleteMany({ where: { createdBy: stale.id } })
        await prisma.expense.deleteMany({ where: { payerId: stale.id } })
      }
      await prisma.user.deleteMany({ where: { email: user.email ?? '' } })
      await prisma.user.create({
        data: {
          id: user.id,
          name,
          email: user.email ?? '',
          ...(googleAvatarUrl && { avatarUrl: googleAvatarUrl }),
        },
      })
    } else {
      throw e
    }
  }

  // Backfill Google avatar for users who already have a row but no avatar set
  // (e.g. email signup → Google OAuth, or first sign-in where metadata wasn't ready)
  if (googleAvatarUrl) {
    await prisma.user.updateMany({
      where: { id: user.id, avatarUrl: null },
      data: { avatarUrl: googleAvatarUrl },
    })
  }
}
