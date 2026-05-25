'use client'

import { signInWithGoogle } from '@/app/actions/oauth'
import { GoogleIcon } from './google-icon'

export function GoogleSignInButton({ label = 'Continue with Google' }: { label?: string }) {
  return (
    <form action={signInWithGoogle}>
      <button
        type="submit"
        className="w-full h-14 flex items-center justify-center gap-3 rounded-xl bg-primary text-primary-foreground text-base font-semibold transition-all active:scale-[0.97] hover:bg-primary-deep"
      >
        <GoogleIcon />
        {label}
      </button>
    </form>
  )
}
