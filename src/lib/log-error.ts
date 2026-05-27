import { headers } from 'next/headers'

/**
 * Structured error logger for server actions and API routes.
 * Emits a single JSON line to Vercel Logs (or stdout in dev).
 * Re-throws non-ValidationErrors so the caller's error boundary catches them.
 */
const SENSITIVE_KEY_RE = /token|secret|password|apikey|service[_-]?role|authorization/i

function redactContext(obj: Record<string, unknown>, depth = 0): Record<string, unknown> {
  if (depth > 3) return obj
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (SENSITIVE_KEY_RE.test(k)) {
      out[k] = '[REDACTED]'
    } else if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = redactContext(v as Record<string, unknown>, depth + 1)
    } else {
      out[k] = v
    }
  }
  return out
}

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
      ctx: redactContext(ctx),
      error:
        err instanceof Error
          ? { message: err.message, stack: err.stack?.split('\n').slice(0, 5) }
          : String(err),
      ts: new Date().toISOString(),
    }),
  )
}
