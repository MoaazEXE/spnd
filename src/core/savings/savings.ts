// Derives "saved by waiting" totals from SKIPPED items — never stored, always computed on read
export interface SkippedItem {
  amountCents: number
  resolvedAt: Date | string | null
}

/** Total cents saved by skipping impulses. */
export function computeSavedCents(items: SkippedItem[]): number {
  return items.reduce((sum, item) => sum + item.amountCents, 0)
}

/** Savings per calendar month (YYYY-MM) for chart data. */
export function computeSavedByMonth(items: SkippedItem[]): Map<string, number> {
  const byMonth = new Map<string, number>()
  for (const item of items) {
    if (!item.resolvedAt) continue
    const d = new Date(item.resolvedAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    byMonth.set(key, (byMonth.get(key) ?? 0) + item.amountCents)
  }
  return byMonth
}

export interface SavingsDataPoint {
  date: string           // YYYY-MM-DD
  cumulativeCents: number
}

export interface DailySavingsPoint {
  date: string  // YYYY-MM-DD
  cents: number // non-cumulative daily total
}

export interface SkippedSummary {
  totalCents: number
  thisMonthCents: number
  cumulativeByDay: SavingsDataPoint[]
  rawByDay: DailySavingsPoint[]
}

/** Convert a Date to a local YYYY-MM-DD string using Intl (handles all timezones). */
function localDateKey(d: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d)
  const y = parts.find(p => p.type === 'year')!.value
  const mo = parts.find(p => p.type === 'month')!.value
  const dy = parts.find(p => p.type === 'day')!.value
  return `${y}-${mo}-${dy}`
}

/** Get today's local date string, then build a date range going back `days` days. */
function buildDateRange(days: number, timezone: string): string[] {
  const now = new Date()
  const keys: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    // subtract exactly 24h per day — close enough for savings bucketing (DST edge is rare)
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    keys.push(localDateKey(d, timezone))
  }
  return keys
}

/** Local year-month string for "this month" comparison. */
function localYearMonth(d: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(d)
  const y = parts.find(p => p.type === 'year')!.value
  const mo = parts.find(p => p.type === 'month')!.value
  return `${y}-${mo}`
}

/**
 * Single-pass aggregation over the skipped list. Walks the items ONCE to
 * build the per-day bucket map, then derives every chart series from that
 * map. Replaces five separate passes on the dashboard.
 */
export function summarizeSkipped(items: SkippedItem[], days = 30, timezone = 'UTC'): SkippedSummary {
  const now = new Date()
  const thisMonth = localYearMonth(now, timezone)

  let totalCents = 0
  let thisMonthCents = 0
  const byDay = new Map<string, number>()

  for (const item of items) {
    totalCents += item.amountCents
    if (!item.resolvedAt) continue
    const d = new Date(item.resolvedAt)
    if (localYearMonth(d, timezone) === thisMonth) {
      thisMonthCents += item.amountCents
    }
    const key = localDateKey(d, timezone)
    byDay.set(key, (byDay.get(key) ?? 0) + item.amountCents)
  }

  const dateRange = buildDateRange(days, timezone)
  const cumulativeByDay: SavingsDataPoint[] = []
  const rawByDay: DailySavingsPoint[] = []
  let cumulative = 0
  for (const key of dateRange) {
    const cents = byDay.get(key) ?? 0
    cumulative += cents
    cumulativeByDay.push({ date: key, cumulativeCents: cumulative })
    rawByDay.push({ date: key, cents })
  }

  return { totalCents, thisMonthCents, cumulativeByDay, rawByDay }
}

/** Skip rate as a 0-100 integer. Returns 0 when no resolved items exist. */
export function computeSkipRate(skippedCount: number, boughtCount: number): number {
  const total = skippedCount + boughtCount
  if (total === 0) return 0
  return Math.round((skippedCount / total) * 100)
}

/** Cents saved from SKIPPED items resolved in the current calendar month. */
export function computeThisMonthSavedCents(items: SkippedItem[]): number {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  return items.reduce((sum, item) => {
    if (!item.resolvedAt) return sum
    const d = new Date(item.resolvedAt)
    return d.getFullYear() === y && d.getMonth() === m ? sum + item.amountCents : sum
  }, 0)
}

/** Daily (non-cumulative) savings for heatmap — each bucket is that day only. */
export function bucketSavingsByDayRaw(items: SkippedItem[], days = 30): DailySavingsPoint[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const byDay = new Map<string, number>()
  for (const item of items) {
    if (!item.resolvedAt) continue
    const d = new Date(item.resolvedAt)
    d.setHours(0, 0, 0, 0)
    const key = d.toISOString().slice(0, 10)
    byDay.set(key, (byDay.get(key) ?? 0) + item.amountCents)
  }
  const result: DailySavingsPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    result.push({ date: key, cents: byDay.get(key) ?? 0 })
  }
  return result
}

/**
 * Consecutive save-streak ending today. If today has no saves yet, start counting
 * from yesterday so we don't penalize an incomplete day. Returns 0 when no streak.
 * Input must be ordered earliest → today (as produced by bucketSavingsByDayRaw).
 */
export function computeSavingsStreak(days: DailySavingsPoint[]): number {
  if (days.length === 0) return 0
  let i = days.length - 1
  // Skip today only if it's empty — preserves yesterday's streak mid-day
  if (days[i].cents === 0) i--
  let streak = 0
  while (i >= 0 && days[i].cents > 0) {
    streak++
    i--
  }
  return streak
}

/** Returns the single biggest savings day in the window, or null if all zero. */
export function bestDailySavings(days: DailySavingsPoint[]): DailySavingsPoint | null {
  let best: DailySavingsPoint | null = null
  for (const d of days) {
    if (d.cents > 0 && (!best || d.cents > best.cents)) best = d
  }
  return best
}

/**
 * Returns the last `days` calendar days as a running cumulative total of savings.
 * Days with no skipped items still appear (carrying the previous cumulative value).
 */
export function bucketSavingsByDay(items: SkippedItem[], days = 14): SavingsDataPoint[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Build a lookup: YYYY-MM-DD → cents saved that day
  const byDay = new Map<string, number>()
  for (const item of items) {
    if (!item.resolvedAt) continue
    const d = new Date(item.resolvedAt)
    d.setHours(0, 0, 0, 0)
    const key = d.toISOString().slice(0, 10)
    byDay.set(key, (byDay.get(key) ?? 0) + item.amountCents)
  }

  const result: SavingsDataPoint[] = []
  let cumulative = 0

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    cumulative += byDay.get(key) ?? 0
    result.push({ date: key, cumulativeCents: cumulative })
  }

  return result
}
