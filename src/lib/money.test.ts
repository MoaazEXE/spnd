import { describe, it, expect } from 'vitest'
import { parseAmountToCents } from './money'

describe('parseAmountToCents', () => {
  it('parses whole amounts', () => {
    expect(parseAmountToCents('10')).toBe(1000)
    expect(parseAmountToCents('1')).toBe(100)
    expect(parseAmountToCents('0')).toBe(0)
  })

  it('parses two-decimal amounts exactly', () => {
    expect(parseAmountToCents('19.99')).toBe(1999)
    expect(parseAmountToCents('0.01')).toBe(1)
    expect(parseAmountToCents('0.10')).toBe(10)
    expect(parseAmountToCents('9.90')).toBe(990)
  })

  it('parses one-decimal amounts', () => {
    expect(parseAmountToCents('0.1')).toBe(10)
    expect(parseAmountToCents('1.5')).toBe(150)
    expect(parseAmountToCents('19.9')).toBe(1990)
  })

  it('accepts comma as decimal separator', () => {
    expect(parseAmountToCents('1,50')).toBe(150)
    expect(parseAmountToCents('19,99')).toBe(1999)
  })

  it('avoids float imprecision', () => {
    // 0.1 + 0.2 = 0.30000000000000004 in float; string parse avoids this
    expect(parseAmountToCents('0.30')).toBe(30)
    expect(parseAmountToCents('0.10')).toBe(10)
  })

  it('rejects more than two decimal places', () => {
    expect(parseAmountToCents('1.005')).toBeNull()
    expect(parseAmountToCents('0.001')).toBeNull()
  })

  it('rejects empty and non-numeric input', () => {
    expect(parseAmountToCents('')).toBeNull()
    expect(parseAmountToCents('abc')).toBeNull()
    expect(parseAmountToCents('12abc')).toBeNull()
    expect(parseAmountToCents('.')).toBeNull()
  })

  it('rejects negative values', () => {
    expect(parseAmountToCents('-1')).toBeNull()
    expect(parseAmountToCents('-0.50')).toBeNull()
  })
})
