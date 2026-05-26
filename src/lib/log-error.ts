import { headers } from 'next/headers'

/**
 * Structured error logger for server actions and API routes.
 * Emits a single JSON line to Vercel Logs (or stdout in dev).
 * Re-throws non-ValidationErrors so the caller's error boundary catches them.
 */
export async function logError(scope: string, ctx: Record<string, unknown>, err: unknown) {
  let requestId: string | null = null
  try {
    const hdrs = await headers()
    requestId = hdrs.get('x-vercel-id') ?? hdrs.get('x-request-id')
  } catch {
    // headers() may not be available outside a request context
  }

  console.error(
    JSON.stringify({
      scope,
      requestId,
      ctx,
      error:
        err instanceof Error
          ? { message: err.message, stack: err.stack?.split('\n').slice(0, 5) }
          : String(err),
      ts: new Date().toISOString(),
    }),
  )
}
