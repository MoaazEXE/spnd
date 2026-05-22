'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signUp } from '@/app/actions/auth'
import { signInWithGoogle } from '@/app/actions/oauth'
import { Button } from '@/components/ui/button'

const inputClass =
  'w-full h-[52px] px-4 rounded-[14px] bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  )
}

export default function SignupPage() {
  const [state, action, isPending] = useActionState(signUp, null)

  if (state === 'check-email') {
    return (
      <div className="w-full max-w-sm text-center space-y-4">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-[10px] bg-primary mb-3">
          <span className="text-primary-foreground font-bold text-lg">S</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We sent a confirmation link to your inbox. Click it to activate your account — then come back and sign in.
        </p>
        <Link href="/login" className="text-primary text-sm font-medium hover:underline block">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-[10px] bg-primary mb-3">
          <span className="text-primary-foreground font-bold text-lg">S</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Create your account</h1>
        <p className="text-sm text-muted-foreground">Start pausing before you spend.</p>
      </div>

      <div className="bg-card rounded-[20px] p-6 shadow-[0_1px_2px_rgba(31,42,46,0.04),0_4px_16px_rgba(31,42,46,0.04)] space-y-4">
        {/* Google OAuth */}
        <form action={signInWithGoogle}>
          <button
            type="submit"
            className="w-full h-12 flex items-center justify-center gap-3 rounded-[14px] border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[11px] font-medium text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Email / password */}
        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-[11px] font-semibold uppercase tracking-[0.4px] text-muted-foreground">
              Name
            </label>
            <input id="name" name="name" type="text" required autoComplete="name" placeholder="Your name" className={inputClass} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-[0.4px] text-muted-foreground">
              Email
            </label>
            <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={inputClass} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-[0.4px] text-muted-foreground">
              Password
            </label>
            <input id="password" name="password" type="password" required autoComplete="new-password" placeholder="At least 8 characters" minLength={8} className={inputClass} />
          </div>

          {state && state !== 'check-email' && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-[10px]">{state}</p>
          )}

          <Button type="submit" disabled={isPending} className="w-full h-12 rounded-[14px] text-sm font-semibold">
            {isPending ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
