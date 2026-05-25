import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

const PROTECTED = ['/dashboard', '/cooling', '/groups', '/settings']
const AUTH_ONLY = ['/login', '/signup']

/**
 * Optimistic auth check + cookie refresh.
 *
 * We do NOT call `supabase.auth.getUser()` or `getClaims()` here — both make
 * network round-trips (verify-with-server / JWKS fetch) and would tax every
 * single navigation. Instead we look for the presence of a Supabase auth
 * cookie. Real verification happens in Server Components via
 * `getCurrentUser()`, which is also cached per-request.
 *
 * This is the pattern Supabase + Next.js officially recommend for middleware:
 * https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export function proxy(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request })

  // Touch the SSR client purely to keep the auth cookie fresh — Supabase
  // rotates it on access. We don't await any auth calls.
  createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Supabase SSR cookie names:
  //   sb-<project-ref>-auth-token          (single, small JWT)
  //   sb-<project-ref>-auth-token.0/.1/…   (chunked, large JWT — OAuth tokens are usually chunked)
  const hasSession = request.cookies
    .getAll()
    .some(c => c.name.startsWith('sb-') && c.name.includes('auth-token'))

  const { pathname } = request.nextUrl

  if (!hasSession && PROTECTED.some(p => pathname.startsWith(p))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (hasSession && AUTH_ONLY.some(p => pathname.startsWith(p))) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/|api/|auth/callback|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|otf)$).*)',
  ],
}
