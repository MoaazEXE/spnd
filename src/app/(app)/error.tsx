'use client'

import { useEffect } from 'react'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[App error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-5 text-center">
      <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
        <span className="text-xl text-destructive">!</span>
      </div>
      <h2 className="mb-1 text-base font-semibold text-foreground">Something went wrong</h2>
      <p className="mb-4 max-w-xs text-xs text-muted-foreground leading-relaxed">
        {error.message || 'Could not load this page.'}
      </p>
      <button
        onClick={reset}
        className="h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-deep transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
