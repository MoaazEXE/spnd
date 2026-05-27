import { simplifyDebts } from './simplifyDebts'
import type { Payment } from '@/types'

interface GuestShare {
  shareCents: number
  guest: { id?: string; addedBy: string }
}

interface ExpenseLike {
  payerId: string
  amountCents: number
  shares: { userId: string; shareCents: number }[]
  guestShares?: GuestShare[]
}

/**
 * Encode a guest as a debt-graph node so its debts surface in the settle plan
 * even when the sponsor is also the payer. Without this, "I paid, I split with
 * my own guest" nets to zero on every side and the settle page reports
 * "everyone is even" — which hides the very flow the user wants to see.
 *
 * Resolution back to a real userId happens at settle-time, not here.
 */
export const guestNodeId = (guestId: string) => `guest:${guestId}`
export const isGuestNodeId = (id: string) => id.startsWith('guest:')
export const guestIdFromNode = (id: string) =>
  isGuestNodeId(id) ? id.slice('guest:'.length) : null

/**
 * Net balance per node: positive = others owe them, negative = they owe.
 *
 * Nodes are either user ids OR `guest:${guestId}`. A guest's debt is the
 * guest's own — not the sponsor's — so paying yourself for your own guest
 * still shows up.
 */
export function computeBalances(expenses: ExpenseLike[]): Map<string, number> {
  const net = new Map<string, number>()
  for (const e of expenses) {
    net.set(e.payerId, (net.get(e.payerId) ?? 0) + e.amountCents)
    for (const s of e.shares) {
      net.set(s.userId, (net.get(s.userId) ?? 0) - s.shareCents)
    }
    for (const gs of (e.guestShares ?? [])) {
      const guestNode = gs.guest.id ? guestNodeId(gs.guest.id) : guestNodeId(gs.guest.addedBy)
      net.set(guestNode, (net.get(guestNode) ?? 0) - gs.shareCents)
    }
  }
  return net
}

/** Greedy min-cashflow settlement plan. Guests appear as their own nodes. */
export function settlementPlan(expenses: ExpenseLike[]): Payment[] {
  const raw = expenses.flatMap(e => [
    ...e.shares
      .filter(s => s.userId !== e.payerId)
      .map(s => ({ from: s.userId, to: e.payerId, amountCents: s.shareCents })),
    ...(e.guestShares ?? []).map(gs => {
      const node = gs.guest.id ? guestNodeId(gs.guest.id) : guestNodeId(gs.guest.addedBy)
      return { from: node, to: e.payerId, amountCents: gs.shareCents }
    }),
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
