import { describe, it, expect } from 'vitest'
import { computeMilestones } from './milestones'

const now = new Date()
const past = (days: number) => new Date(now.getTime() - days * 86_400_000)

const skippedItem = (amountCents: number, coolingDays = 1) => ({
  amountCents,
  coolingUntil: past(0),   // cooling ended now
  createdAt: past(coolingDays),  // item was created coolingDays ago
  resolvedAt: past(0),
})

describe('computeMilestones', () => {
  it('returns all 7 milestones', () => {
    const result = computeMilestones({ skippedItems: [], boughtItems: [], totalSavedCents: 0, groupCoolingActive: false })
    expect(result.total).toBe(7)
    expect(result.all).toHaveLength(7)
  })

  it('first_skip unlocks when one item is skipped', () => {
    const result = computeMilestones({
      skippedItems: [skippedItem(500)],
      boughtItems: [],
      totalSavedCents: 500,
      groupCoolingActive: false,
    })
    const m = result.all.find(m => m.id === 'first_skip')!
    expect(m.unlocked).toBe(true)
    expect(result.count).toBe(1)
  })

  it('thousand unlocks at RM 1000 (100000 cents)', () => {
    const result = computeMilestones({
      skippedItems: [skippedItem(100_000)],
      boughtItems: [],
      totalSavedCents: 100_000,
      groupCoolingActive: false,
    })
    const m = result.all.find(m => m.id === 'thousand')!
    expect(m.unlocked).toBe(true)
  })

  it('thousand does not unlock at RM 999', () => {
    const result = computeMilestones({
      skippedItems: [skippedItem(99_900)],
      boughtItems: [],
      totalSavedCents: 99_900,
      groupCoolingActive: false,
    })
    const m = result.all.find(m => m.id === 'thousand')!
    expect(m.unlocked).toBe(false)
    expect(m.pct).toBeCloseTo(0.999, 2)
  })

  it('half_off is gated when fewer than 5 total decisions', () => {
    const result = computeMilestones({
      skippedItems: [skippedItem(100), skippedItem(100), skippedItem(100)],
      boughtItems: [{ amountCents: 100 }],
      totalSavedCents: 300,
      groupCoolingActive: false,
    })
    const m = result.all.find(m => m.id === 'half_off')!
    expect(m.gated).toBe(true)
    expect(m.pct).toBe(0)
  })

  it('half_off unlocks when 5+ decisions and skip rate >= 50%', () => {
    const skipped = Array.from({ length: 5 }, () => skippedItem(100))
    const result = computeMilestones({
      skippedItems: skipped,
      boughtItems: [{ amountCents: 100 }],
      totalSavedCents: 500,
      groupCoolingActive: false,
    })
    const m = result.all.find(m => m.id === 'half_off')!
    // 5 skip + 1 buy = ~83% skip rate
    expect(m.unlocked).toBe(true)
  })

  it('group_save unlocks when groupCoolingActive is true', () => {
    const result = computeMilestones({
      skippedItems: [],
      boughtItems: [],
      totalSavedCents: 0,
      groupCoolingActive: true,
    })
    const m = result.all.find(m => m.id === 'group_save')!
    expect(m.unlocked).toBe(true)
  })

  it('ten_skips shows correct progress', () => {
    const skipped = Array.from({ length: 6 }, () => skippedItem(100))
    const result = computeMilestones({
      skippedItems: skipped,
      boughtItems: [],
      totalSavedCents: 600,
      groupCoolingActive: false,
    })
    const m = result.all.find(m => m.id === 'ten_skips')!
    expect(m.unlocked).toBe(false)
    expect(m.pct).toBeCloseTo(0.6, 2)
  })

  it('five_thousand unlocks at RM 5000', () => {
    const result = computeMilestones({
      skippedItems: [],
      boughtItems: [],
      totalSavedCents: 500_000,
      groupCoolingActive: false,
    })
    const m = result.all.find(m => m.id === 'five_thousand')!
    expect(m.unlocked).toBe(true)
  })

  it('next points to the closest non-gated locked milestone', () => {
    // Only first_skip unlocked, but set up so ten_skips is at 90% progress
    const skipped = Array.from({ length: 9 }, () => skippedItem(100))
    const result = computeMilestones({
      skippedItems: skipped,
      boughtItems: [{ amountCents: 100 }],
      totalSavedCents: 900,
      groupCoolingActive: false,
    })
    // ten_skips has highest pct among locked — should be next
    expect(result.next?.id).toBe('ten_skips')
  })

  it('returns null next when all milestones unlocked', () => {
    const skipped = [
      skippedItem(1_000_000 / 10, 8), // 8-day cooling unlocks 'patient'
      ...Array.from({ length: 9 }, () => skippedItem(1_000_000 / 10)),
    ]
    const result = computeMilestones({
      skippedItems: skipped,
      boughtItems: [{ amountCents: 100 }],
      totalSavedCents: 1_000_000,
      groupCoolingActive: true,
    })
    // All milestones unlocked
    result.all.forEach(m => {
      if (m.unlocked) return
      // Only non-unlocked ones would make next non-null
    })
    // All 7 should be unlocked with these params
    expect(result.locked).toHaveLength(0)
    expect(result.next).toBeNull()
  })
})
