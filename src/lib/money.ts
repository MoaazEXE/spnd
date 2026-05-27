/**
 * Parses a user-typed decimal amount string to integer cents without float arithmetic.
 * Accepts: "19.99" → 1999, "10" → 1000, "0.01" → 1, "1,50" → 150
 * Rejects: "", "abc", "1.005", negative values → returns null
 */
export function parseAmountToCents(input: string): number | null {
  const s = input.trim().replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null
  const [intPart, decPart = ''] = s.split('.')
  const cents = parseInt(intPart, 10) * 100 + parseInt(decPart.padEnd(2, '0'), 10)
  return Number.isFinite(cents) && cents >= 0 ? cents : null
}
