// Debt simplification via minimum cash flow — greedy net-balance algorithm
import type { Payment } from '@/types'

interface RawTransaction {
  from: string
  to: string
  amountCents: number
}

export function simplifyDebts(transactions: RawTransaction[]): Payment[] {
  // 1. Net balance: positive = owed money, negative = owes money
  const net = new Map<string, number>()
  for (const t of transactions) {
    net.set(t.to,   (net.get(t.to)   ?? 0) + t.amountCents)
    net.set(t.from, (net.get(t.from) ?? 0) - t.amountCents)
  }

  // 2. Separate into creditors and debtors
  const creditors = [...net.entries()]
    .filter(([, v]) => v > 0)
    .map(([id, balance]) => ({ id, balance }))
    .sort((a, b) => b.balance - a.balance)

  const debtors = [...net.entries()]
    .filter(([, v]) => v < 0)
    .map(([id, balance]) => ({ id, balance }))
    .sort((a, b) => a.balance - b.balance)

  // 3. Greedily match largest creditor with largest debtor
  const payments: Payment[] = []
  let ci = 0
  let di = 0
  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci]
    const debtor   = debtors[di]
    const pay      = Math.min(creditor.balance, -debtor.balance)
    if (pay > 0) {
      payments.push({ from: debtor.id, to: creditor.id, amountCents: pay })
    }
    creditor.balance -= pay
    debtor.balance   += pay
    if (creditor.balance === 0) ci++
    if (debtor.balance   === 0) di++
  }

  return payments
}
