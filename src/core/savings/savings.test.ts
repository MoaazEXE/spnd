import { describe, it, expect } from 'vitest'
import {
  computeSavedCents,
  bucketSavingsByDay,
  computeSavingsStreak,
  bestDailySavings,
} from './savings'

describe('computeSavedCents', () => {
  it('returns 0 for empty list', () => {
    expect(computeSavedCents([])).toBe(0)
  })

  it('sums all item amounts regardless of resolvedAt', () => {
    expect(computeSavedCents([
      { amountCents: 1000, resolvedAt: new Date() },
      { amountCents: 500, resolvedAt: null },
    ])).toBe(1500)
  })
})

describe('bucketSavingsByDay', () => {
  it('returns N entries for N days', () => {
    expect(bucketSavingsByDay([], 7)).toHaveLength(7)
    expect(bucketSavingsByDay([], 14)).toHaveLength(14)
  })

  it('all zeroes when no items', () => {
    const result = bucketSavingsByDay([], 7)
    expect(result.every(p => p.cumulativeCents === 0)).toBe(true)
  })

  it('accumulates items from today into cumulative total', () => {
    const today = new Date()
    const result = bucketSavingsByDay(
      [{ amountCents: 2000, resolvedAt: today }],
      7,
    )
    // Last entry is today — cumulative should include today's amount
    expect(result[result.length - 1].cumulativeCents).toBe(2000)
  })

  it('items older than the window are excluded', () => {
    const old = new Date()
    old.setDate(old.getDate() - 30)
    const result = bucketSavingsByDay(
      [{ amountCents: 9999, resolvedAt: old }],
      14,
    )
    expect(result.every(p => p.cumulativeCents === 0)).toBe(true)
  })

  it('cumulative value never decreases', () => {
    const items = [
      { amountCents: 500, resolvedAt: new Date() },
      { amountCents: 300, resolvedAt: (() => { const d = new Date(); d.setDate(d.getDate() - 3); return d })() },
    ]
    const result = bucketSavingsByDay(items, 14)
    for (let i = 1; i < result.length; i++) {
      expect(result[i].cumulativeCents).toBeGreaterThanOrEqual(result[i - 1].cumulativeCents)
    }
  })

  it('dates are in ascending order', () => {
    const result = bucketSavingsByDay([], 5)
    for (let i = 1; i < result.length; i++) {
      expect(result[i].date > result[i - 1].date).toBe(true)
    }
  })
})

describe('computeSavingsStreak', () => {
  it('returns 0 for empty input', () => {
    expect(computeSavingsStreak([])).toBe(0)
  })

  it('returns 0 when no day has savings', () => {
    expect(computeSavingsStreak([
      { date: '2026-05-20', cents: 0 },
      { date: '2026-05-21', cents: 0 },
      { date: '2026-05-22', cents: 0 },
    ])).toBe(0)
  })

  it('counts consecutive days ending today', () => {
    expect(computeSavingsStreak([
      { date: '2026-05-20', cents: 100 },
      { date: '2026-05-21', cents: 200 },
      { date: '2026-05-22', cents: 50 }, // today
    ])).toBe(3)
  })

  it('preserves streak when today is empty (mid-day grace)', () => {
    expect(computeSavingsStreak([
      { date: '2026-05-20', cents: 100 },
      { date: '2026-05-21', cents: 200 },
      { date: '2026-05-22', cents: 0 }, // today not done yet
    ])).toBe(2)
  })

  it('breaks streak at first gap before today', () => {
    expect(computeSavingsStreak([
      { date: '2026-05-19', cents: 100 },
      { date: '2026-05-20', cents: 0 }, // gap
      { date: '2026-05-21', cents: 200 },
      { date: '2026-05-22', cents: 50 },
    ])).toBe(2)
  })

  it('returns 0 when yesterday is empty and today is empty', () => {
    expect(computeSavingsStreak([
      { date: '2026-05-21', cents: 0 },
      { date: '2026-05-22', cents: 0 },
    ])).toBe(0)
  })
})

describe('bestDailySavings', () => {
  it('returns null when no day has savings', () => {
    expect(bestDailySavings([{ date: '2026-05-22', cents: 0 }])).toBeNull()
    expect(bestDailySavings([])).toBeNull()
  })

  it('returns the single biggest day', () => {
    const best = bestDailySavings([
      { date: '2026-05-20', cents: 100 },
      { date: '2026-05-21', cents: 500 },
      { date: '2026-05-22', cents: 200 },
    ])
    expect(best).toEqual({ date: '2026-05-21', cents: 500 })
  })

  it('ties go to the earliest day', () => {
    const best = bestDailySavings([
      { date: '2026-05-20', cents: 300 },
      { date: '2026-05-21', cents: 300 },
    ])
    expect(best?.date).toBe('2026-05-20')
  })
})
