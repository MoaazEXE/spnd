'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function GroupsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('[Groups error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-5 text-center">
      <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="var(--destructive)" strokeWidth="1.8" />
          <path d="M12 8v5" stroke="var(--destructive)" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="16" r="1" fill="var(--destructive)" />
        </svg>
      </div>
      <h2 className="mb-1 text-lg font-semibold text-foreground">Could not load groups</h2>
      <p className="mb-5 max-w-xs text-sm text-muted-foreground leading-relaxed">
        There was a problem loading your groups. This is usually temporary — try refreshing.
      </p>
      <button
        onClick={() => { router.refresh(); setTimeout(reset, 100) }}
        className="h-11 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-deep transition-colors"
      >
        Refresh
      </button>
    </div>
  )
}
