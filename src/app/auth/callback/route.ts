import { createClient } from '@/lib/supabase/server'
import { ensureUserRecord } from '@/lib/ensure-user'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=Missing+auth+code`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] exchangeCodeForSession failed:', error.message, error)
    return NextResponse.redirect(`${origin}/login?error=Could+not+authenticate`)
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    try {
      await ensureUserRecord(user)
    } catch (e) {
      console.error('[auth/callback] ensureUserRecord failed:', e)
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
