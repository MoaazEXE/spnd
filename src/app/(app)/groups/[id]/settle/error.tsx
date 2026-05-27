'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function SettleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const params = useParams<{ id: string }>()

  useEffect(() => {
    console.error('[Settle error]', error)
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
      <h2 className="mb-1 text-lg font-semibold text-foreground">Could not load settle-up</h2>
      <p className="mb-5 max-w-xs text-sm text-muted-foreground leading-relaxed">
        There was a problem loading the settlement plan. Try going back and refreshing.
      </p>
      <div className="flex gap-3">
        <Link
          href={`/groups/${params?.id ?? ''}`}
          className="h-11 px-5 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors inline-flex items-center"
        >
          Back to group
        </Link>
        <button
          onClick={reset}
          className="h-11 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-deep transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
