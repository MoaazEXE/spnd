import { prisma } from '@/lib/prisma'

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
  const metadataName =
    user.user_metadata && typeof user.user_metadata.name === 'string'
      ? (user.user_metadata.name as string)
      : null
  const name = metadataName ?? user.email?.split('@')[0] ?? 'User'

  // Copy Google profile picture on first sign-in via OAuth
  const googleAvatarUrl =
    user.user_metadata && typeof user.user_metadata.avatar_url === 'string'
      ? (user.user_metadata.avatar_url as string)
      : undefined

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
      // Replace the stale row; Item.onDelete:Cascade cleans up orphaned items.
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
}
