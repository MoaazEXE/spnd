import { simplifyDebts } from './simplifyDebts'
import type { Payment } from '@/types'

interface GuestShare {
  shareCents: number
  guest: { addedBy: string }
}

interface ExpenseLike {
  payerId: string
  amountCents: number
  shares: { userId: string; shareCents: number }[]
  guestShares?: GuestShare[]
}

/**
 * Net balance per member: positive = others owe them, negative = they owe.
 *
 * Guest shares are attributed to the guest's sponsor (addedBy user):
 *   sponsor.balance -= guestShare   (sponsor covers for their guest)
 *   payer.balance   += guestShare   (payer gets credit)
 */
export function computeBalances(expenses: ExpenseLike[]): Map<string, number> {
  const net = new Map<string, number>()
  for (const e of expenses) {
    net.set(e.payerId, (net.get(e.payerId) ?? 0) + e.amountCents)
    for (const s of e.shares) {
      net.set(s.userId, (net.get(s.userId) ?? 0) - s.shareCents)
    }
    for (const gs of (e.guestShares ?? [])) {
      const sponsor = gs.guest.addedBy
      net.set(e.payerId, (net.get(e.payerId) ?? 0) + gs.shareCents)
      net.set(sponsor,   (net.get(sponsor)   ?? 0) - gs.shareCents)
    }
  }
  return net
}

/** Greedy min-cashflow settlement plan derived from expense list.
 *  Guest shares are attributed to their sponsor: sponsor → payer. */
export function settlementPlan(expenses: ExpenseLike[]): Payment[] {
  const raw = expenses.flatMap(e => [
    ...e.shares
      .filter(s => s.userId !== e.payerId)
      .map(s => ({ from: s.userId, to: e.payerId, amountCents: s.shareCents })),
    ...(e.guestShares ?? [])
      .filter(gs => gs.guest.addedBy !== e.payerId)
      .map(gs => ({ from: gs.guest.addedBy, to: e.payerId, amountCents: gs.shareCents })),
  ])
  return simplifyDebts(raw)
}

/** Equal split — distribute amountCents across N members, rounding remainder to the payer. */
export function equalSplit(
  amountCents: number,
  memberIds: string[],
  payerId: string,
): { userId: string; shareCents: number }[] {
  if (memberIds.length === 0) return []
  const base = Math.floor(amountCents / memberIds.length)
  const remainder = amountCents - base * memberIds.length
  return memberIds.map(userId => ({
    userId,
    shareCents: userId === payerId ? base + remainder : base,
  }))
}
