'use client'

import { useEffect } from 'react'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Root error]', error)
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-background p-7">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-xl text-destructive">!</span>
          </div>
          <h1 className="mb-1 text-base font-semibold text-foreground">Something went wrong</h1>
          <p className="mb-6 text-xs text-muted-foreground leading-relaxed">
            {error.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={reset}
            className="h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-deep transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
