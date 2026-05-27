import { notFound, redirect } from 'next/navigation'
import { groupsRepo } from '@/data/groups.repo'
import { getUserContext } from '@/lib/user-context'
import { settlementPlan, guestIdFromNode } from '@/core/debt/groupBalances'
import { SettleShell, type PlanRow, type EvidenceRow } from './_components/settle-shell'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SettlePage({ params }: PageProps) {
  const { id } = await params
  const ctx = await getUserContext()
  if (!ctx) redirect('/login')

  const group = await groupsRepo.findByIdDeep(id, ctx.id)
  if (!group) notFound()

  const nameById = new Map(group.members.map(m => [m.userId, m.user.name]))
  const avatarById = new Map(group.members.map(m => [m.userId, m.user.avatarUrl]))
  const guestById = new Map(
    group.guestMembers.map(g => [g.id, { name: g.name, sponsor: g.addedBy }]),
  )

  // Label a debt-graph node — could be a real user OR a `guest:<id>` synthetic node.
  // Always uses the real name; pronouns ("You") are not used in plan rows.
  function labelFor(nodeId: string): string {
    const guestId = guestIdFromNode(nodeId)
    if (guestId) {
      const g = guestById.get(guestId)
      return g ? g.name : 'Guest'
    }
    return nameById.get(nodeId) ?? 'Member'
  }
  function avatarFor(nodeId: string): string | null {
    if (guestIdFromNode(nodeId)) return null
    return avatarById.get(nodeId) ?? null
  }
  function kindOf(nodeId: string): 'me' | 'my-guest' | 'others-guest' | 'user' {
    const guestId = guestIdFromNode(nodeId)
    if (guestId) {
      return guestById.get(guestId)?.sponsor === ctx!.id ? 'my-guest' : 'others-guest'
    }
    return nodeId === ctx!.id ? 'me' : 'user'
  }
  // The acting user is "on" a row if they're directly a party OR if they
  // sponsor a guest on either side (since the cashflow is theirs to cover).
  function involvesActingUser(nodeId: string): boolean {
    const k = kindOf(nodeId)
    return k === 'me' || k === 'my-guest'
  }

  const plan: PlanRow[] = settlementPlan(group.expenses).map(p => ({
    fromId: p.from,
    fromLabel: labelFor(p.from),
    fromAvatarUrl: avatarFor(p.from),
    toId: p.to,
    toLabel: labelFor(p.to),
    toAvatarUrl: avatarFor(p.to),
    amountCents: p.amountCents,
    involvesYou: involvesActingUser(p.from) || involvesActingUser(p.to),
    youArePayer: involvesActingUser(p.from),
    fromKind: kindOf(p.from),
    toKind: kindOf(p.to),
    guestBreakdown: [],
  }))

  const evidence: EvidenceRow[] = group.expenses
    .filter(e => e.description !== 'Settlement')
    .map(e => ({
      id: e.id,
      title: e.description,
      payerName: e.payerId === ctx.id ? 'You' : (e.payer?.name ?? 'Member'),
      shareCount: e.shares.length + (e.guestShares?.length ?? 0),
      amountCents: e.amountCents,
      guestNames: (e.guestShares ?? []).map(gs => gs.guest.name),
    }))

  return (
    <SettleShell
      groupId={group.id}
      groupName={group.name}
      plan={plan}
      evidence={evidence}
    />
  )
}
