import { notFound, redirect } from 'next/navigation'
import { groupsRepo } from '@/data/groups.repo'
import { getUserContext } from '@/lib/user-context'
import { computeBalances } from '@/core/debt/groupBalances'
import { GroupDetailShell } from './_components/group-detail-shell'

interface PageProps {
  params: Promise<{ id: string }>
}

export interface GroupMemberView {
  id: string
  name: string
  avatarUrl: string | null
  joinedAt: string
  balanceCents: number
}

export interface GroupActivityView {
  id: string
  type: 'split' | 'settlement'
  title: string
  description: string
  amountCents: number
  perPersonCents: number
  payerId: string
  payerName: string
  shareCount: number
  createdAt: string
}

export default async function GroupPage({ params }: PageProps) {
  const { id } = await params
  const ctx = await getUserContext()
  if (!ctx) redirect('/login')

  const group = await groupsRepo.findByIdDeep(id, ctx.id)
  if (!group) notFound()

  const expenses = group.expenses
  const memberCount = group.members.length
  const balances = computeBalances(expenses)
  const savedTogetherCents = group.items.reduce((sum, i) => sum + i.amountCents, 0)

  const members: GroupMemberView[] = group.members.map(m => ({
    id: m.user.id,
    name: m.userId === ctx.id ? `${m.user.name} (you)` : m.user.name,
    avatarUrl: m.user.avatarUrl,
    joinedAt: m.joinedAt.toISOString(),
    balanceCents: balances.get(m.userId) ?? 0,
  }))

  const activity: GroupActivityView[] = expenses.map(e => {
    const isSettlement = e.description === 'Settlement'
    const payerLabel = e.payerId === ctx.id ? 'You' : e.payer.name
    return {
      id: e.id,
      type: isSettlement ? 'settlement' : 'split',
      title: isSettlement
        ? `${payerLabel} paid ${
            group.members.find(m => m.userId === e.shares[0]?.userId)?.user.name ?? 'a member'
          }`
        : e.description,
      description: e.description,
      amountCents: e.amountCents,
      perPersonCents: e.shares.find(s => s.userId === ctx.id)?.shareCents ?? 0,
      payerId: e.payerId,
      payerName: payerLabel,
      shareCount: e.shares.length,
      createdAt: e.createdAt.toISOString(),
    }
  })

  return (
    <GroupDetailShell
      groupId={group.id}
      groupName={group.name}
      members={members}
      activity={activity}
      currentUserId={ctx.id}
      isCreator={group.createdBy === ctx.id}
      savedTogetherCents={savedTogetherCents}
      youBalanceCents={balances.get(ctx.id) ?? 0}
    />
  )
}
