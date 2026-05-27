export const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/

export const RESERVED_USERNAMES = new Set([
  'admin', 'settle', 'support', 'help', 'root',
  'system', 'api', 'www', 'me', 'you', 'null', 'undefined',
])

export function normalizeUsername(input: string): string {
  return input.trim().toLowerCase()
}

export function validateUsername(input: string): { ok: true } | { ok: false; reason: string } {
  const s = normalizeUsername(input)
  if (s.length < 3) return { ok: false, reason: 'Username must be at least 3 characters.' }
  if (s.length > 20) return { ok: false, reason: 'Username must be 20 characters or fewer.' }
  if (!/^[a-z0-9_]+$/.test(s)) return { ok: false, reason: 'Only lowercase letters, numbers, and underscores are allowed.' }
  if (/^[0-9_]/.test(s)) return { ok: false, reason: 'Username cannot start with a number or underscore.' }
  if (RESERVED_USERNAMES.has(s)) return { ok: false, reason: 'That username is reserved — pick another.' }
  return { ok: true }
}

/** Generate a username suggestion from an email local-part (for onboarding prefill and backfill). */
export function generateFromEmail(email: string): string {
  const local = email.split('@')[0] ?? 'user'
  // Lowercase, replace non-alphanumeric/underscore with nothing, max 20 chars
  let base = local.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20)
  // Strip leading underscores and digits
  base = base.replace(/^[_0-9]+/, '')
  if (base.length < 3) base = ('user' + base).slice(0, 20)
  return base || 'user'
}
