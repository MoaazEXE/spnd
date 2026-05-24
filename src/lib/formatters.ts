/** Format cents as Malaysian Ringgit. decimals=2 for totals, 0 for list rows. */
export function fmtRM(cents: number, decimals: 0 | 2 = 2): string {
  return (
    'RM ' +
    new Intl.NumberFormat('en-MY', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(cents / 100)
  )
}

/** Human-readable countdown from milliseconds remaining. */
export function fmtCountdown(ms: number): string {
  if (ms <= 0) return 'Ready'
  const totalSec = Math.floor(ms / 1000)
  const d = Math.floor(totalSec / 86400)
  const h = Math.floor((totalSec % 86400) / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (d > 0) return `${d}d ${h}h left`
  if (h > 0) return `${h}h ${m}m left`
  if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s left`
  return `${s}s left`
}

/** Parse a stored cooling period string like "1d" into value + unit. */
export function parseCoolingPeriod(s: string): { value: number; unit: 'HOURS' | 'DAYS' | 'WEEKS' } {
  const match = s.match(/^(\d+)([hdw])$/)
  if (!match) return { value: 1, unit: 'DAYS' }
  const value = parseInt(match[1], 10)
  const unit = match[2] === 'h' ? 'HOURS' : match[2] === 'd' ? 'DAYS' : 'WEEKS'
  return { value, unit }
}
