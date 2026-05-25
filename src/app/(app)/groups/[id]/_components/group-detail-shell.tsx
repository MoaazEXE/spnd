'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag, Clock, UserPlus } from 'lucide-react'
import { fmtRM } from '@/lib/formatters'
import { Avatar } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useGroupRealtime } from '@/lib/use-group-realtime'
import { AddExpenseSheet } from './add-expense-sheet'
import { AddMemberSheet } from './add-member-sheet'
import { EditExpenseSheet } from './edit-expense-sheet'
import { ActivityList } from './activity-list'
import { MembersList } from './members-list'
import { DangerZone } from './danger-zone'
import { TransferOwnershipSheet } from './transfer-ownership-sheet'
import type { GroupMemberView, GroupActivityView } from '../page'

type Tab = 'activity' | 'cooling' | 'members'

interface Props {
  groupId: string
  groupName: string
  members: GroupMemberView[]
  activity: GroupActivityView[]
  currentUserId: string
  isCreator: boolean
  savedTogetherCents: number
  youBalanceCents: number
}

export function GroupDetailShell({
  groupId,
  groupName,
  members,
  activity,
  currentUserId,
  isCreator,
  savedTogetherCents,
  youBalanceCents,
}: Props) {
  const [tab, setTab] = useState<Tab>('activity')
  const [adding, setAdding] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [transferring, setTransferring] = useState(false)
  const [editing, setEditing] = useState<GroupActivityView | null>(null)
  useGroupRealtime(groupId)

  const hasSplitActivity = activity.some(a => a.type === 'split')

  return (
    <div className="max-w-[640px] mx-auto px-5 lg:px-12 pt-4 lg:pt-8 pb-32 lg:pb-16">
      <div className="mb-3 flex items-center justify-between">
        <Link
          href="/groups"
          prefetch
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={2} />
          Groups
        </Link>
        <button
          type="button"
          onClick={() => setInviting(true)}
          aria-label="Invite member"
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-foreground/5 transition-colors"
        >
          <UserPlus size={18} strokeWidth={1.8} className="text-foreground" />
        </button>
      </div>

      <Card padding="md" className="text-center mb-4">
        <div className="flex justify-center mb-3">
          <Avatar name={groupName} size={56} shape="square" />
        </div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          {groupName}
        </h1>

        <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Saved together
        </p>
        <p className="mt-1 font-display text-4xl font-semibold text-primary tabular-nums tracking-tight">
          {fmtRM(savedTogetherCents)}
        </p>

        <div className="mt-4 flex items-center justify-center gap-1">
          {members.map((m, i) => (
            <div
              key={m.id}
              className="rounded-full shadow-[0_0_0_3px_var(--card)]"
              style={{ marginLeft: i > 0 ? -8 : 0 }}
            >
              <Avatar name={m.name} size={28} />
            </div>
          ))}
        </div>

        {youBalanceCents !== 0 && (
          <div className="mt-4 flex justify-center gap-2.5">
            <Link
              href={`/groups/${groupId}/settle`}
              prefetch
              className="inline-flex items-center px-3.5 h-9 rounded-lg border border-border bg-background text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              {youBalanceCents > 0
                ? `You're owed ${fmtRM(youBalanceCents, 0)}`
                : `You owe ${fmtRM(Math.abs(youBalanceCents), 0)}`}
            </Link>
            <Link
              href={`/groups/${groupId}/settle`}
              prefetch
              className="inline-flex items-center px-3.5 h-9 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-deep transition-colors"
            >
              Settle up
            </Link>
          </div>
        )}
      </Card>

      <div className="bg-card rounded-xl p-1 mb-4 shadow-card flex">
        {(
          [
            { id: 'activity', label: 'Activity' },
            { id: 'cooling', label: 'Cooling' },
            { id: 'members', label: `Members · ${members.length}` },
          ] as const
        ).map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'flex-1 h-9 rounded-lg text-xs font-semibold transition-colors',
              tab === t.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'activity' && (
        <ActivityList
          activity={activity}
          onEdit={setEditing}
          memberCount={members.length}
          groupId={groupId}
          showResplitAll={hasSplitActivity}
        />
      )}
      {tab === 'cooling' && <CoolingTabEmpty />}
      {tab === 'members' && (
        <>
          <MembersList members={members} onInvite={() => setInviting(true)} />
          <DangerZone
            groupId={groupId}
            groupName={groupName}
            isCreator={isCreator}
            youBalanceCents={youBalanceCents}
            members={members}
            currentUserId={currentUserId}
            onTransferRequest={() => setTransferring(true)}
          />
        </>
      )}

      <div className="fixed lg:static bottom-[60px] lg:bottom-auto inset-x-0 lg:inset-auto px-5 lg:px-0 py-3 lg:py-0 lg:mt-6 bg-background lg:bg-transparent border-t lg:border-t-0 border-sep z-10">
        <div className="max-w-[640px] mx-auto flex gap-2.5">
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex-1 h-11 rounded-lg bg-primary-tint text-primary-deep text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-primary-soft transition-colors active:scale-[0.97]"
          >
            <ShoppingBag size={16} strokeWidth={1.8} />
            Add expense
          </button>
          <button
            type="button"
            disabled
            title="Coming next sprint"
            className="flex-1 h-11 rounded-lg bg-gold-tint text-gold-deep text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Clock size={16} strokeWidth={1.8} />
            Cool on it
          </button>
        </div>
      </div>

      {adding && (
        <AddExpenseSheet
          groupId={groupId}
          members={members.map(m => ({
            id: m.id,
            name: m.name,
            isYou: m.id === currentUserId,
          }))}
          onClose={() => setAdding(false)}
        />
      )}
      {inviting && (
        <AddMemberSheet groupId={groupId} onClose={() => setInviting(false)} />
      )}
      {editing && (
        <EditExpenseSheet
          expenseId={editing.id}
          initialDescription={editing.description}
          initialAmountCents={editing.amountCents}
          shareCount={editing.shareCount}
          memberCount={members.length}
          payerName={editing.payerName}
          isSettlement={editing.type === 'settlement'}
          onClose={() => setEditing(null)}
        />
      )}
      {transferring && (
        <TransferOwnershipSheet
          groupId={groupId}
          groupName={groupName}
          currentUserId={currentUserId}
          members={members}
          onClose={() => setTransferring(false)}
        />
      )}
    </div>
  )
}

function CoolingTabEmpty() {
  return (
    <Card className="text-center py-10" padding="none">
      <div className="mx-auto w-12 h-12 rounded-full bg-primary-tint flex items-center justify-center text-primary mb-3">
        <Clock size={20} strokeWidth={1.8} />
      </div>
      <p className="text-sm font-semibold text-foreground">No cooling proposals yet.</p>
      <p className="mt-1 text-xs text-muted-foreground max-w-xs mx-auto">
        Shared cool-offs let everyone weigh in before the group commits. Coming soon.
      </p>
    </Card>
  )
}
