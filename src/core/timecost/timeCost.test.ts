import { describe, it, expect } from 'vitest'
import { calculateTimeCost } from './timeCost'

const base = {
  monthlyIncomeCents: 500_000, // RM 5,000/month
  workingHoursPerWeek: 40,
  mode: 'SIMPLE' as const,
}

describe('calculateTimeCost — SIMPLE mode', () => {
  it('returns a positive number of hours for a non-zero amount', () => {
    const result = calculateTimeCost({ ...base, amountCents: 10_000 })
    expect(result.hours).toBeGreaterThan(0)
  })

  it('returns zero hours when income is zero', () => {
    const result = calculateTimeCost({ ...base, monthlyIncomeCents: 0, amountCents: 10_000 })
    expect(result.hours).toBe(0)
    expect(result.formatted).toBe('0 min')
  })

  it('is proportional: doubling the price doubles the hours', () => {
    const r1 = calculateTimeCost({ ...base, amountCents: 10_000 })
    const r2 = calculateTimeCost({ ...base, amountCents: 20_000 })
    expect(r2.hours).toBeCloseTo(r1.hours * 2, 5)
  })

  it('formats as minutes when hours < 1', () => {
    // Very small amount relative to income
    const result = calculateTimeCost({ ...base, amountCents: 100 })
    expect(result.formatted).toMatch(/min/)
  })

  it('formats with hours when hours >= 1', () => {
    // Large amount: RM 500 against RM 5000/month, 40h/week → ~4h
    const result = calculateTimeCost({ ...base, amountCents: 50_000 })
    expect(result.formatted).toMatch(/h/)
  })

  it('formats as days (with hours in parens) when hours >= 24', () => {
    // RM 5000 against RM 5000/month, 40h/week → ~173h → ~7.2 days
    const result = calculateTimeCost({ ...base, amountCents: 500_000 })
    expect(result.formatted).toMatch(/days? \(\d+h\)/)
  })

  it('uses singular "day" near 24h (rounds to 1 day)', () => {
    // hourly rate ≈ 2874 cents/h → 70,000 cents ≈ 24.4h → 1.0 days → "1 day"
    const result = calculateTimeCost({ ...base, amountCents: 70_000 })
    expect(result.formatted).toMatch(/^1 day/)
  })
})

describe('calculateTimeCost — TRUE_HOURLY mode', () => {
  it('costs more hours than SIMPLE when commute is non-zero', () => {
    const simple     = calculateTimeCost({ ...base, amountCents: 10_000, mode: 'SIMPLE' })
    const trueHourly = calculateTimeCost({
      ...base,
      amountCents: 10_000,
      mode: 'TRUE_HOURLY',
      commuteHours: 1, // 1h/day commute
    })
    expect(trueHourly.hours).toBeGreaterThan(simple.hours)
  })

  it('costs more hours than SIMPLE when work costs reduce effective income', () => {
    const simple     = calculateTimeCost({ ...base, amountCents: 10_000, mode: 'SIMPLE' })
    const trueHourly = calculateTimeCost({
      ...base,
      amountCents: 10_000,
      mode: 'TRUE_HOURLY',
      workCostsCents: 50_000, // RM 500/month work costs
    })
    expect(trueHourly.hours).toBeGreaterThan(simple.hours)
  })
})
