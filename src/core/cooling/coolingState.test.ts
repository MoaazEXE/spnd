import { describe, it, expect } from 'vitest'
import { getCoolingStatus, computeCoolingUntil, getRemainingMs } from './coolingState'

describe('getCoolingStatus', () => {
  it('returns COOLING when coolingUntil is in the future', () => {
    const future = new Date(Date.now() + 60_000)
    expect(getCoolingStatus({ status: 'COOLING', coolingUntil: future })).toBe('COOLING')
  })

  it('returns READY_TO_RESOLVE when coolingUntil has passed', () => {
    const past = new Date(Date.now() - 1_000)
    expect(getCoolingStatus({ status: 'COOLING', coolingUntil: past })).toBe('READY_TO_RESOLVE')
  })

  it('returns READY_TO_RESOLVE when coolingUntil is null', () => {
    expect(getCoolingStatus({ status: 'COOLING', coolingUntil: null })).toBe('READY_TO_RESOLVE')
  })

  it('passes through BOUGHT unchanged', () => {
    const item = { status: 'BOUGHT' as const, coolingUntil: new Date(Date.now() + 99_999) }
    expect(getCoolingStatus(item)).toBe('BOUGHT')
  })

  it('passes through SKIPPED unchanged', () => {
    expect(getCoolingStatus({ status: 'SKIPPED', coolingUntil: null })).toBe('SKIPPED')
  })

  it('accepts an explicit now parameter', () => {
    const coolingUntil = new Date('2024-06-01T12:00:00Z')
    const before = new Date('2024-06-01T11:00:00Z')
    const after  = new Date('2024-06-01T13:00:00Z')
    expect(getCoolingStatus({ status: 'COOLING', coolingUntil }, before)).toBe('COOLING')
    expect(getCoolingStatus({ status: 'COOLING', coolingUntil }, after)).toBe('READY_TO_RESOLVE')
  })
})

describe('computeCoolingUntil', () => {
  const from = new Date('2024-01-01T00:00:00Z')

  it('adds hours', () => {
    expect(computeCoolingUntil(from, 5, 'HOURS').getTime())
      .toBe(from.getTime() + 5 * 60 * 60 * 1000)
  })

  it('adds days', () => {
    expect(computeCoolingUntil(from, 1, 'DAYS').getTime())
      .toBe(from.getTime() + 24 * 60 * 60 * 1000)
  })

  it('adds weeks', () => {
    expect(computeCoolingUntil(from, 1, 'WEEKS').getTime())
      .toBe(from.getTime() + 7 * 24 * 60 * 60 * 1000)
  })
})

describe('getRemainingMs', () => {
  it('returns 0 when cooling has passed', () => {
    const past = new Date(Date.now() - 5_000)
    expect(getRemainingMs(past)).toBe(0)
  })

  it('returns positive ms when still cooling', () => {
    const future = new Date(Date.now() + 10_000)
    expect(getRemainingMs(future)).toBeGreaterThan(0)
  })
})
