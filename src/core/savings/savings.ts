// Derives "saved by waiting" totals from SKIPPED items — never stored, always computed on read
export interface SkippedItem {
  amountCents: number
  resolvedAt: Date | null
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
    const key = `${item.resolvedAt.getFullYear()}-${String(item.resolvedAt.getMonth() + 1).padStart(2, '0')}`
    byMonth.set(key, (byMonth.get(key) ?? 0) + item.amountCents)
  }
  return byMonth
}

export interface SavingsDataPoint {
  date: string           // YYYY-MM-DD
  cumulativeCents: number
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
