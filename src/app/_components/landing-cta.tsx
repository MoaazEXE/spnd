'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signInWithGoogle } from '@/app/actions/oauth'
import { GoogleIcon } from '@/components/ui/google-icon'

export function LandingCta() {
  const [agreed, setAgreed] = useState(false)

  return (
    <div className="mt-10 lg:mt-12 space-y-4">
      <label className="flex items-start gap-2.5 cursor-pointer">
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

      <Link
        href="/signup"
        prefetch
        aria-disabled={!agreed}
        className={`block w-full h-14 lg:h-16 rounded-2xl bg-primary text-primary-foreground text-base lg:text-lg font-semibold flex items-center justify-center transition-all active:scale-[0.98] hover:bg-primary-deep${!agreed ? ' opacity-40 pointer-events-none' : ''}`}
      >
        Create account
      </Link>

      <form action={signInWithGoogle}>
        <button
          type="submit"
          disabled={!agreed}
          className="w-full h-14 lg:h-16 rounded-2xl bg-background border border-border text-foreground text-base lg:text-lg font-semibold flex items-center justify-center gap-3 transition-colors hover:bg-muted active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground pt-1">
        Have an account?{' '}
        <Link href="/login" prefetch className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}
