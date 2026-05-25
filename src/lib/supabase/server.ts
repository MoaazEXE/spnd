import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'

/**
 * Server-side Supabase client — use in Server Components, Server Actions, Route Handlers.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component where cookies can't be set — safe to ignore
          }
        },
      },
    }
  )
}

export interface AuthUser {
  id: string
  email: string | undefined
  user_metadata: Record<string, unknown> | undefined
}

/**
 * Per-request cached lookup of the authenticated user — LOCAL ONLY, no network.
 *
 * Uses `getSession()` which reads the auth cookie via the SSR adapter and
 * returns the cached User. NO round-trip to Supabase Auth, so page renders
 * are fast.
 *
 * Trade-off: if a session is revoked server-side (sign-out elsewhere, password
 * change), this returns the stale user until the cookie refreshes. The proxy
 * already gates protected routes by cookie presence, and security-critical
 * mutations should call `verifyAuthUser()` below for a fresh server check.
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return null
  return {
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata,
  }
})

/**
 * Strict authenticated-user lookup — network call to Supabase Auth.
 * Use this when you're about to perform a sensitive mutation and want to be
 * certain the session hasn't been revoked.
 */
export const verifyAuthUser = cache(async (): Promise<AuthUser | null> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return {
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata,
  }
})
