'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signIn } from '@/app/actions/auth'
import { signInWithGoogle } from '@/app/actions/oauth'

const inputClass =
  'w-full h-[52px] px-4 rounded-[14px] bg-card border border-[rgba(31,42,46,0.12)] text-[15px] font-medium text-foreground placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all'

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

export default function LoginPage() {
  const [error, action, isPending] = useActionState(signIn, null)

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-9 h-9 rounded-[12px] bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-[15px]">S</span>
        </div>
        <span className="text-[22px] font-bold tracking-[-0.5px] text-foreground">Settle</span>
      </div>

      {/* Hero copy */}
      <div className="mb-6">
        <p className="text-[13px] font-semibold text-primary uppercase tracking-[1.2px] mb-3">
          The money you didn&apos;t spend
        </p>
        <h1 className="text-[36px] font-bold leading-[1.05] tracking-[-1.4px] text-foreground mb-4">
          Pause before<br />you buy.{' '}
          <span className="text-primary">Keep what&apos;s yours.</span>
        </h1>
      </div>

      {/* Preview card */}
      <div className="bg-card rounded-[22px] p-5 mb-6 shadow-[0_1px_2px_rgba(31,42,46,0.04),0_4px_16px_rgba(31,42,46,0.04)]">
        <p className="text-[12px] font-medium text-[var(--text-muted)] uppercase tracking-[0.4px]">Saved by waiting</p>
        <p className="text-[36px] font-bold text-primary tracking-[-1px] tabular-nums mt-1">RM 1,247.50</p>
        <div className="flex items-center gap-1.5 mt-2">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#A8893E" aria-hidden="true">
            <path d="M12 3l1.8 5.4L19 10.2 13.8 12 12 17.4 10.2 12 5 10.2l5.2-1.8L12 3z" />
          </svg>
          <span className="text-[13px] text-[var(--gold-deep)] font-medium">42 hours of your life</span>
        </div>
      </div>

      {/* Google — primary CTA */}
      <form action={signInWithGoogle} className="mb-3">
        <button
          type="submit"
          className="w-full h-[56px] flex items-center justify-center gap-3 rounded-[16px] bg-primary text-primary-foreground text-[16px] font-semibold transition-all active:scale-[0.97] hover:bg-[var(--primary-deep)]"
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[12px] font-medium text-[var(--text-muted)]">or sign in with email</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Email / password */}
      <form action={action} className="space-y-3">
        <input name="email" type="email" required autoComplete="email" placeholder="Email address" className={inputClass} />
        <input name="password" type="password" required autoComplete="current-password" placeholder="Password" className={inputClass} />

        {error && (
          <p className="text-[13px] text-destructive bg-destructive/10 px-3 py-2 rounded-[10px]">{error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-[48px] rounded-[14px] bg-[var(--primary-tint)] text-[var(--primary-deep)] text-[15px] font-semibold transition-all active:scale-[0.97] disabled:opacity-50"
        >
          {isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-[14px] text-[var(--text-muted)] mt-6">
        New here?{' '}
        <Link href="/signup" className="text-primary font-semibold hover:underline">
          Create account
        </Link>
      </p>
    </div>
  )
}
