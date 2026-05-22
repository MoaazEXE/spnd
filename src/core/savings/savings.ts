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
