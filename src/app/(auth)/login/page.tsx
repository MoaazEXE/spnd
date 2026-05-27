'use client'

import { useActionState, useEffect } from 'react'
import Link from 'next/link'
import { signIn } from '@/app/actions/auth'
import { Input } from '@/components/ui/input'
import { Divider } from '@/components/ui/divider'
import { ErrorBanner } from '@/components/ui/error-banner'
import { SubmitButton } from '@/components/ui/submit-button'
import { GoogleSignInButton } from '@/components/ui/google-sign-in-button'
import { AuthHero } from '../_components/auth-hero'

export default function LoginPage() {
  const [error, action, isPending] = useActionState(signIn, null)

  useEffect(() => {
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) window.location.reload()
    }
    window.addEventListener('pageshow', onPageShow)
    return () => window.removeEventListener('pageshow', onPageShow)
  }, [])

  return (
    <div className="w-full max-w-sm">
      <AuthHero
        eyebrow="The money you didn't spend"
        title={
          <>
            Pause before
            <br />
            you buy.
          </>
        }
        description="Sign in to see what you've saved."
      />

      <GoogleSignInButton />

      <Divider label="or sign in with email" />

      <form action={action} className="space-y-3">
        <Input name="email" type="email" required autoComplete="email" placeholder="Email address" />
        <Input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Password"
        />
        <ErrorBanner message={error} />
        <SubmitButton pending={isPending} pendingLabel="Signing in…">
          Sign in
        </SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{' '}
        <Link href="/signup" prefetch className="font-semibold text-primary hover:underline">
          Create account
        </Link>
      </p>
    </div>
  )
}
