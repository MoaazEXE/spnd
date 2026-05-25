'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag, Clock, UserPlus, Scale } from 'lucide-react'
import { fmtRM } from '@/lib/formatters'
import { Avatar } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { AddExpenseSheet } from './add-expense-sheet'
import { AddMemberSheet } from './add-member-sheet'
import { EditExpenseSheet } from './edit-expense-sheet'
import type { GroupMemberView, GroupActivityView } from '../page'

type Tab = 'activity' | 'cooling' | 'members'

interface Props {
  groupId: string
  groupName: string
  members: GroupMemberView[]
  activity: GroupActivityView[]
  currentUserId: string
  savedTogetherCents: number
  youBalanceCents: number
}

export function GroupDetailShell({
  groupId,
  groupName,
  members,
  activity,
  currentUserId,
  savedTogetherCents,
  youBalanceCents,
}: Props) {
  const [tab, setTab] = useState<Tab>('activity')
  const [adding, setAdding] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [editing, setEditing] = useState<GroupActivityView | null>(null)

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
        <MembersList
          members={members}
          currentUserId={currentUserId}
          onInvite={() => setInviting(true)}
        />
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
    </div>
  )
}

function ActivityList({
  activity,
  onEdit,
  memberCount,
  groupId,
  showResplitAll,
}: {
  activity: GroupActivityView[]
  onEdit: (a: GroupActivityView) => void
  memberCount: number
  groupId: string
  showResplitAll: boolean
}) {
  if (activity.length === 0) {
    return (
      <Card className="text-center py-8" padding="none">
        <p className="text-sm font-semibold text-foreground">No activity yet.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Add your first expense to start splitting.
        </p>
      </Card>
    )
  }
  return (
    <>
      <div className="flex flex-col gap-2.5">
        {activity.map(a => {
          const isSettlement = a.type === 'settlement'
          const subtitle = isSettlement
            ? 'Settlement'
            : `${a.payerName} paid · split ${
                a.shareCount === memberCount ? 'equally' : `between ${a.shareCount}`
              }`
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => onEdit(a)}
              className="text-left w-full rounded-2xl bg-card shadow-card p-4 transition-all hover:-translate-y-[1px] hover:shadow-card-hover active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                    isSettlement
                      ? 'bg-primary-tint text-primary-deep'
                      : 'bg-coral-tint text-coral-deep',
                  )}
                >
                  <ShoppingBag size={16} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-foreground tabular-nums">
                    {fmtRM(a.amountCents, 0)}
                  </p>
                  {!isSettlement && a.perPersonCents > 0 && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">
                      You: {fmtRM(a.perPersonCents, 0)}
                    </p>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {showResplitAll && memberCount > 1 && (
        <Link
          href={`/groups/${groupId}/resplit`}
          prefetch
          className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-sep-strong px-4 py-3 text-sm font-semibold text-primary hover:bg-card transition-colors"
        >
          <Scale size={14} strokeWidth={1.8} />
          Re-split all activities equally
        </Link>
      )}
    </>
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

function MembersList({
  members,
  onInvite,
}: {
  members: GroupMemberView[]
  currentUserId: string
  onInvite: () => void
}) {
  return (
    <>
      <Card padding="none">
        {members.map((m, i) => (
          <div
            key={m.id}
            className={cn(
              'flex items-center gap-3.5 px-4 py-3.5',
              i < members.length - 1 && 'border-b border-sep',
            )}
          >
            <Avatar name={m.name} size={36} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{m.name}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Joined{' '}
                {new Date(m.joinedAt).toLocaleDateString('en-MY', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
            <p
              className={cn(
                'text-xs font-semibold tabular-nums flex-shrink-0',
                m.balanceCents > 0
                  ? 'text-primary'
                  : m.balanceCents < 0
                    ? 'text-coral-deep'
                    : 'text-muted-foreground',
              )}
            >
              {m.balanceCents === 0
                ? '—'
                : (m.balanceCents > 0 ? '+' : '−') + fmtRM(Math.abs(m.balanceCents), 0)}
            </p>
          </div>
        ))}
      </Card>
      <button
        type="button"
        onClick={onInvite}
        className="mt-3 w-full rounded-2xl border-[1.5px] border-dashed border-sep-strong px-4 py-3 text-sm font-semibold text-primary hover:bg-card transition-colors"
      >
        + Invite by email
      </button>
    </>
  )
}
