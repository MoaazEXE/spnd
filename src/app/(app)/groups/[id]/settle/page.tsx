import { notFound, redirect } from 'next/navigation'
import { groupsRepo } from '@/data/groups.repo'
import { getUserContext } from '@/lib/user-context'
import { settlementPlan } from '@/core/debt/groupBalances'
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
  const labelFor = (uid: string) => (uid === ctx.id ? 'You' : nameById.get(uid) ?? 'Member')

  const plan: PlanRow[] = settlementPlan(group.expenses).map(p => ({
    fromId: p.from,
    fromLabel: labelFor(p.from),
    fromAvatarUrl: avatarById.get(p.from) ?? null,
    toId: p.to,
    toLabel: labelFor(p.to),
    toAvatarUrl: avatarById.get(p.to) ?? null,
    amountCents: p.amountCents,
    involvesYou: p.from === ctx.id || p.to === ctx.id,
    youArePayer: p.from === ctx.id,
  }))

  const evidence: EvidenceRow[] = group.expenses
    .filter(e => e.description !== 'Settlement')
    .map(e => ({
      id: e.id,
      title: e.description,
      payerName: e.payerId === ctx.id ? 'You' : e.payer.name,
      shareCount: e.shares.length,
      amountCents: e.amountCents,
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
