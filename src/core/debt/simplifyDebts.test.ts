import { describe, it, expect } from 'vitest'
import { simplifyDebts } from './simplifyDebts'

describe('simplifyDebts', () => {
  it('returns empty array when no transactions', () => {
    expect(simplifyDebts([])).toEqual([])
  })

  it('returns the single transaction when only one exists', () => {
    const result = simplifyDebts([{ from: 'alice', to: 'bob', amountCents: 1000 }])
    expect(result).toEqual([{ from: 'alice', to: 'bob', amountCents: 1000 }])
  })

  it('nets out opposing debts between two people', () => {
    // alice→bob 1000, bob→alice 400 → alice owes bob 600
    const result = simplifyDebts([
      { from: 'alice', to: 'bob', amountCents: 1000 },
      { from: 'bob',   to: 'alice', amountCents: 400 },
    ])
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ from: 'alice', to: 'bob', amountCents: 600 })
  })

  it('collapses A→B→C chain into a single A→C payment', () => {
    const result = simplifyDebts([
      { from: 'a', to: 'b', amountCents: 1000 },
      { from: 'b', to: 'c', amountCents: 1000 },
    ])
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ from: 'a', to: 'c', amountCents: 1000 })
  })

  it('produces zero payments for a balanced triangle (A→B→C→A)', () => {
    const result = simplifyDebts([
      { from: 'a', to: 'b', amountCents: 1000 },
      { from: 'b', to: 'c', amountCents: 1000 },
      { from: 'c', to: 'a', amountCents: 1000 },
    ])
    expect(result).toHaveLength(0)
  })

  it('uses fewer payments than raw transactions for a complex group', () => {
    // 4-person group: A paid for everyone, B paid for C and D
    // Net: a=+7500, b=+500, c=-4000, d=-4000 → simplified total = 8000
    const result = simplifyDebts([
      { from: 'b', to: 'a', amountCents: 2500 },
      { from: 'c', to: 'a', amountCents: 2500 },
      { from: 'd', to: 'a', amountCents: 2500 },
      { from: 'c', to: 'b', amountCents: 1500 },
      { from: 'd', to: 'b', amountCents: 1500 },
    ])
    const totalPaid = result.reduce((s, p) => s + p.amountCents, 0)
    expect(totalPaid).toBe(8000) // sum of net positive balances
    expect(result.length).toBeLessThan(5)
  })
})
