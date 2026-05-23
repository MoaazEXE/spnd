'use client'

import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Dashboard error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-5 text-center">
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
        <span className="text-xl">!</span>
      </div>
      <h2 className="text-[16px] font-semibold text-foreground mb-1">Something went wrong</h2>
      <p className="text-[13px] text-muted-foreground mb-2 max-w-xs leading-relaxed">
        {error.message || 'Could not load your dashboard.'}
      </p>
      {error.digest && (
        <p className="text-[11px] text-muted-foreground/60 mb-4 font-mono">{error.digest}</p>
      )}
      <button
        onClick={reset}
        className="h-10 px-5 rounded-[12px] bg-primary text-primary-foreground text-sm font-medium"
      >
        Try again
      </button>
    </div>
  )
}
