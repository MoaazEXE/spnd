'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { signUp } from '@/app/actions/auth'
import { Input } from '@/components/ui/input'
import { Divider } from '@/components/ui/divider'
import { ErrorBanner } from '@/components/ui/error-banner'
import { SubmitButton } from '@/components/ui/submit-button'
import { GoogleSignInButton } from '@/components/ui/google-sign-in-button'
import { AuthHero } from '../_components/auth-hero'

function CheckEmailScreen() {
  return (
    <div className="w-full max-w-sm text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary-tint">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 12l4.5 4.5L19 7"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary-deep"
          />
        </svg>
      </div>
      <h1 className="mb-3 text-2xl font-bold tracking-tight">Check your email</h1>
      <p className="mb-6 text-base text-muted-foreground leading-relaxed">
        We sent a confirmation link to your inbox. Click it to activate your account — then come
        back and sign in.
      </p>
      <Link href="/login" prefetch className="text-base font-semibold text-primary hover:underline">
        Back to sign in
      </Link>
    </div>
  )
}

export default function SignupPage() {
  const [state, action, isPending] = useActionState(signUp, null)
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) window.location.reload()
    }
    window.addEventListener('pageshow', onPageShow)
    return () => window.removeEventListener('pageshow', onPageShow)
  }, [])

  if (state === 'check-email') return <CheckEmailScreen />

  return (
    <div className="w-full max-w-sm">
      <AuthHero
        eyebrow="The money you didn't spend"
        title={
          <>
            Start pausing
            <br />
            before you buy.
          </>
        }
        description="Log temptations, wait them out, and watch what you save."
      />

      <label className="flex items-start gap-2.5 cursor-pointer mb-4">
        <input
          type="checkbox"
          checked={agreed}
          onChange={e => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border border-border accent-primary cursor-pointer"
        />
        <span className="text-xs text-subtle-foreground leading-relaxed">
          I agree to the{' '}
          <Link href="/privacy" prefetch className="underline underline-offset-2 hover:text-muted-foreground transition-colors">
            Privacy Policy
          </Link>
        </span>
      </label>

      <GoogleSignInButton disabled={!agreed} />

      <Divider label="or sign up with email" />

      <form action={action} className="space-y-3">
        <Input name="name" type="text" required autoComplete="name" placeholder="Your name" />
        <Input name="email" type="email" required autoComplete="email" placeholder="Email address" />
        <Input
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          placeholder="Password (8+ characters)"
        />
        <ErrorBanner message={state && state !== 'check-email' ? state : null} />
        <SubmitButton pending={isPending} pendingLabel="Creating account…" disabled={!agreed}>
          Create account
        </SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" prefetch className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
