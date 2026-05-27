'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag, Clock, UserPlus, Scale, ArrowRight, Check, Users, ChevronDown, ChevronUp, UserMinus, AlertTriangle, X } from 'lucide-react'
import { toast } from 'sonner'
import { useFmt } from '@/lib/currency-context'
import { Avatar } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { cn } from '@/lib/utils'
import { useGroupRealtime } from '@/lib/use-group-realtime'
import { kickMember, removeGuestMember } from '@/app/actions/groups'
import { AddExpenseSheet } from '../[id]/_components/add-expense-sheet'
import { AddMemberSheet } from '../[id]/_components/add-member-sheet'
import { AddProposalSheet } from '../[id]/_components/add-proposal-sheet'
import { EditExpenseSheet } from '../[id]/_components/edit-expense-sheet'
import { DangerZone } from '../[id]/_components/danger-zone'
import { ProposalCard } from '../[id]/_components/proposal-card'
import { TransferOwnershipSheet } from '../[id]/_components/transfer-ownership-sheet'
import type { GroupMemberView, GroupActivityView, GroupGuestView, GroupProposalView } from '../[id]/page'
import type { PlanRow } from '../[id]/settle/_components/settle-shell'

interface Props {
  groupId: string
  groupName: string
  members: GroupMemberView[]
  guests: GroupGuestView[]
  activity: GroupActivityView[]
  proposals: GroupProposalView[]
  currentUserId: string
  isCreator: boolean
  savedTogetherCents: number
  youBalanceCents: number
  settlePlan: PlanRow[]
  openProposalsCount: number
  onAfterRemoved?: () => void
}

export function GroupDetailPanel({
  groupId,
  groupName,
  members,
  guests,
  activity,
  proposals,
  currentUserId,
  isCreator,
  savedTogetherCents,
  youBalanceCents,
  settlePlan,
  openProposalsCount,
  onAfterRemoved,
}: Props) {
  const fmt = useFmt()
  const router = useRouter()
  const [adding, setAdding] = useState(false)
  const [proposing, setProposing] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [transferring, setTransferring] = useState(false)
  const [editing, setEditing] = useState<GroupActivityView | null>(null)
  const [showMembers, setShowMembers] = useState(false)
  const [removing, setRemoving] = useState<{ type: 'member' | 'guest'; id: string; name: string; balanceCents: number } | null>(null)
  const [removePending, startRemove] = useTransition()
  useGroupRealtime(groupId)

  function doRemove(andResplit: boolean) {
    if (!removing) return
    startRemove(async () => {
      try {
        const fd = new FormData()
        if (removing.type === 'member') {
          fd.set('groupId', groupId)
          fd.set('memberId', removing.id)
          await kickMember(fd)
        } else {
          fd.set('guestId', removing.id)
          await removeGuestMember(fd)
        }
        toast.success(`${removing.name} removed from group`)
        setRemoving(null)
        if (andResplit) {
          router.push(`/groups/${groupId}/resplit`)
        } else {
          router.refresh()
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Could not remove.'
        if (!msg.includes('NEXT_REDIRECT')) toast.error(msg)
        setRemoving(null)
      }
    })
  }

  const removingHasBalance = Math.abs(removing?.balanceCents ?? 0) > 0

  const hasSplitActivity = activity.some(a => a.type === 'split')
  // Resplit-all only matters when there are at least two participants — members
  // OR guests. A solo user with one guest still has a real "split with".
  const memberCount = members.length + guests.length

  const balanceColor =
    youBalanceCents > 0 ? 'text-primary' : youBalanceCents < 0 ? 'text-coral-deep' : 'text-foreground'

  // Combined people strip: members first, then guests (no avatar URL).
  const people: { id: string; name: string; avatarUrl: string | null }[] = [
    ...members.map(m => ({ id: m.id, name: m.id === currentUserId ? 'You' : m.name, avatarUrl: m.avatarUrl })),
    ...guests.map(g => ({ id: `guest:${g.id}`, name: g.name, avatarUrl: null })),
  ]
  const memberNameList = people.map(p => p.name).join(', ')

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-start gap-4">
          <Avatar name={groupName} size={64} shape="square" className="flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground leading-none mb-2">
              {groupName}
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex">
                {people.slice(0, 5).map((p, i) => (
                  <div
                    key={p.id}
                    className="rounded-full shadow-avatar-ring"
                    style={{ marginLeft: i > 0 ? -8 : 0 }}
                  >
                    <Avatar name={p.name} src={p.avatarUrl} size={26} />
                  </div>
                ))}
              </div>
              <span className="text-xs text-muted-foreground truncate">{memberNameList}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="h-9 px-3 rounded-lg border border-border bg-background text-xs font-semibold text-foreground hover:bg-muted transition-colors inline-flex items-center gap-1.5"
            >
              <ShoppingBag size={13} strokeWidth={1.8} />
              Add expense
            </button>
            <button
              type="button"
              onClick={() => setProposing(true)}
              className="h-9 px-3 rounded-lg border border-border bg-background text-xs font-semibold text-foreground hover:bg-muted transition-colors inline-flex items-center gap-1.5"
            >
              <Clock size={13} strokeWidth={1.8} />
              Cool on it
            </button>
            <button
              type="button"
              onClick={() => setInviting(true)}
              title="Add member"
              className="w-9 h-9 rounded-lg border border-border bg-background inline-flex items-center justify-center hover:bg-muted transition-colors"
            >
              <UserPlus size={14} strokeWidth={1.8} className="text-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="mx-6 mb-5">
        <div className="rounded-xl border border-sep bg-background/60 grid grid-cols-3 divide-x divide-sep">
          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Saved Together
            </p>
            <p className="font-display text-2xl font-semibold text-foreground tabular-nums tracking-tight">
              {fmt(savedTogetherCents, 0)}
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Your Balance
            </p>
            <p className={cn('font-display text-2xl font-semibold tabular-nums tracking-tight', balanceColor)}>
              {youBalanceCents > 0 ? '+' : ''}{fmt(youBalanceCents, 0)}
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Open Proposals
            </p>
            <p className="font-display text-2xl font-semibold text-foreground tabular-nums tracking-tight">
              {openProposalsCount}
            </p>
          </div>
        </div>
      </div>

      {/* Body: two columns */}
      <div className="flex gap-5 px-6 pb-6">
        {/* Activity column */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Activity
          </p>

          {activity.length === 0 ? (
            <Card padding="none" className="text-center py-8">
              <p className="text-sm font-semibold text-foreground">No activity yet.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add your first expense to start splitting.
              </p>
            </Card>
          ) : (
            <Card padding="none">
              {activity.map((a, i) => {
                const isSettlement = a.type === 'settlement'
                const subtitle = isSettlement
                  ? 'Settlement'
                  : `${a.payerName} paid · split ${a.shareCount} ways`
                const perPerson = a.shareCount > 0 ? Math.floor(a.amountCents / a.shareCount) : 0
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setEditing(a)}
                    className={cn(
                      'text-left w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50',
                      i < activity.length - 1 && 'border-b border-sep',
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                        isSettlement
                          ? 'bg-primary-tint text-primary-deep'
                          : 'bg-coral-tint text-coral-deep',
                      )}
                    >
                      <ShoppingBag size={14} strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{a.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">{subtitle}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-foreground tabular-nums">
                        {fmt(a.amountCents, 0)}
                      </p>
                      {!isSettlement && perPerson > 0 && (
                        <p className="text-[11px] text-muted-foreground tabular-nums mt-0.5">
                          {fmt(perPerson, 0)} each
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </Card>
          )}

          {hasSplitActivity && memberCount > 1 && (
            <Link
              href={`/groups/${groupId}/resplit`}
              prefetch
              className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-sep-strong px-4 py-2.5 text-xs font-semibold text-primary hover:bg-card transition-colors"
            >
              <Scale size={13} strokeWidth={1.8} />
              Re-split all equally
            </Link>
          )}
        </div>

        {/* Right column */}
        <div className="w-[300px] flex-shrink-0 flex flex-col gap-5">
          {/* Cooling Proposals */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Cooling Proposals
            </p>
            {proposals.length === 0 ? (
              <Card padding="none" className="text-center py-6">
                <div className="mx-auto w-10 h-10 rounded-full bg-primary-tint flex items-center justify-center text-primary mb-2.5">
                  <Clock size={17} strokeWidth={1.8} />
                </div>
                <p className="text-xs text-muted-foreground">No open proposals.</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {proposals.map(p => (
                  <ProposalCard key={p.id} proposal={p} currentUserId={currentUserId} />
                ))}
              </div>
            )}
          </div>

          {/* Settle Up */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Settle Up
            </p>
            {settlePlan.length === 0 ? (
              <Card padding="none" className="text-center py-6">
                <div className="mx-auto w-9 h-9 rounded-full bg-primary-tint flex items-center justify-center text-primary mb-2">
                  <Check size={16} strokeWidth={2} />
                </div>
                <p className="text-xs font-semibold text-foreground">Everyone&apos;s even.</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">No outstanding balances.</p>
              </Card>
            ) : (
              <>
                <Card padding="none">
                  {settlePlan.map((row, i) => (
                    <div
                      key={`${row.fromId}:${row.toId}:${row.amountCents}`}
                      className={cn(
                        'flex items-center gap-2 px-4 py-3',
                        i < settlePlan.length - 1 && 'border-b border-sep',
                      )}
                    >
                      <Avatar name={row.fromLabel} src={row.fromAvatarUrl} size={28} />
                      <p className="text-xs font-semibold text-foreground truncate min-w-0 flex-1">
                        {row.fromLabel}
                      </p>
                      <ArrowRight size={12} strokeWidth={2} className="text-muted-foreground flex-shrink-0" />
                      <p className="text-xs text-muted-foreground truncate flex-1 min-w-0 text-right">
                        {row.toLabel}
                      </p>
                      <Avatar name={row.toLabel} src={row.toAvatarUrl} size={28} />
                      <p className="text-sm font-bold text-foreground tabular-nums flex-shrink-0 min-w-[52px] text-right">
                        {fmt(row.amountCents, 0)}
                      </p>
                    </div>
                  ))}
                </Card>
                <Link
                  href={`/groups/${groupId}/settle`}
                  prefetch
                  className="mt-2.5 w-full inline-flex items-center justify-center h-9 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-deep transition-colors"
                >
                  Settle Up
                </Link>
              </>
            )}
          </div>

          {/* Members (collapsible) */}
          <div>
            <button
              type="button"
              onClick={() => setShowMembers(v => !v)}
              className="w-full flex items-center justify-between mb-3 group"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                Members · {members.length + guests.length}
              </p>
              {showMembers ? (
                <ChevronUp size={13} strokeWidth={2} className="text-muted-foreground" />
              ) : (
                <ChevronDown size={13} strokeWidth={2} className="text-muted-foreground" />
              )}
            </button>

            {showMembers && (
              <>
                <Card padding="none">
                  {members.map((m, i) => (
                    <div
                      key={m.id}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3',
                        (i < members.length - 1 || guests.length > 0) && 'border-b border-sep',
                      )}
                    >
                      <Avatar name={m.name} src={m.avatarUrl} size={28} />
                      <p className="flex-1 min-w-0 text-xs font-semibold text-foreground truncate">
                        {m.id === currentUserId ? 'You' : m.name}
                      </p>
                      <p
                        className={cn(
                          'text-[11px] font-semibold tabular-nums flex-shrink-0',
                          m.balanceCents > 0
                            ? 'text-primary'
                            : m.balanceCents < 0
                              ? 'text-coral-deep'
                              : 'text-muted-foreground',
                        )}
                      >
                        {m.balanceCents === 0
                          ? '—'
                          : (m.balanceCents > 0 ? '+' : '−') + fmt(Math.abs(m.balanceCents), 0)}
                      </p>
                      {isCreator && m.id !== currentUserId && (
                        <button
                          type="button"
                          onClick={() => setRemoving({ type: 'member', id: m.id, name: m.name, balanceCents: m.balanceCents })}
                          disabled={removePending}
                          className="ml-0.5 w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-coral-deep hover:bg-coral-tint transition-colors flex-shrink-0"
                          aria-label={`Remove ${m.name}`}
                        >
                          <UserMinus size={13} strokeWidth={1.8} />
                        </button>
                      )}
                    </div>
                  ))}
                  {guests.map((g, i) => (
                    <div
                      key={g.id}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3',
                        i < guests.length - 1 && 'border-b border-sep',
                      )}
                    >
                      <Avatar name={g.name} size={28} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{g.name}</p>
                        <p className="text-[10px] text-muted-foreground">Guest</p>
                      </div>
                      {(isCreator || g.addedBy === currentUserId) && (
                        <button
                          type="button"
                          onClick={() => setRemoving({ type: 'guest', id: g.id, name: g.name, balanceCents: g.balanceCents })}
                          disabled={removePending}
                          className="ml-0.5 w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-coral-deep hover:bg-coral-tint transition-colors flex-shrink-0"
                          aria-label={`Remove ${g.name}`}
                        >
                          <UserMinus size={13} strokeWidth={1.8} />
                        </button>
                      )}
                    </div>
                  ))}
                </Card>
                <button
                  type="button"
                  onClick={() => setInviting(true)}
                  className="mt-2 w-full rounded-xl border-[1.5px] border-dashed border-sep-strong px-4 py-2.5 text-xs font-semibold text-primary hover:bg-card transition-colors"
                >
                  + Add member
                </button>
                <DangerZone
                  groupId={groupId}
                  groupName={groupName}
                  isCreator={isCreator}
                  youBalanceCents={youBalanceCents}
                  members={members}
                  currentUserId={currentUserId}
                  onTransferRequest={() => setTransferring(true)}
                  onAfterRemoved={onAfterRemoved}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {adding && (
        <AddExpenseSheet
          groupId={groupId}
          members={members.map(m => ({
            id: m.id,
            name: m.name,
            avatarUrl: m.avatarUrl,
            isYou: m.id === currentUserId,
          }))}
          guests={guests}
          onClose={() => setAdding(false)}
        />
      )}
      {inviting && <AddMemberSheet groupId={groupId} onClose={() => setInviting(false)} />}
      {proposing && <AddProposalSheet groupId={groupId} onClose={() => setProposing(false)} />}
      {editing && (
        <EditExpenseSheet
          expenseId={editing.id}
          initialDescription={editing.description}
          initialAmountCents={editing.amountCents}
          shareCount={editing.shareCount}
          memberCount={members.length + guests.length}
          payerName={editing.payerName}
          isSettlement={editing.type === 'settlement'}
          members={members.map(m => ({ id: m.id, name: m.id === currentUserId ? 'You' : m.name, avatarUrl: m.avatarUrl }))}
          guests={guests}
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
      {removing !== null && removingHasBalance && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-foreground/45 backdrop-blur-sm animate-fade-in" onClick={removePending ? undefined : () => setRemoving(null)} />
          <div className="relative w-full max-w-[420px] bg-card rounded-2xl shadow-pop animate-pop overflow-hidden">
            <button type="button" onClick={() => setRemoving(null)} disabled={removePending} aria-label="Close" className="absolute top-2 right-2 w-11 h-11 lg:w-9 lg:h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50">
              <X size={16} strokeWidth={2} />
            </button>
            <div className="px-6 pt-7 pb-5">
              <div className="mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center bg-coral-tint text-coral-deep">
                <AlertTriangle size={20} strokeWidth={1.8} />
              </div>
              <h2 className="text-center text-base font-semibold text-foreground">Remove {removing.name}?</h2>
              <p className="mt-2 text-center text-sm text-muted-foreground leading-relaxed">
                {removing.name} has an outstanding balance of{' '}
                <span className="font-semibold text-foreground">{fmt(Math.abs(removing.balanceCents), 0)}</span>.
                {' '}Their past shares stay on record. Re-split all activity equally across the remaining members, or keep the current split as-is.
              </p>
            </div>
            <div className="px-6 pb-6 flex flex-col gap-2.5">
              <button type="button" onClick={() => doRemove(true)} disabled={removePending} className="w-full h-11 rounded-lg bg-coral-deep text-white text-sm font-semibold hover:bg-coral-deep/90 transition-colors active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed">
                {removePending ? '…' : 'Remove & re-split equally'}
              </button>
              <button type="button" onClick={() => doRemove(false)} disabled={removePending} className="w-full h-11 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50">
                Remove only
              </button>
              <button type="button" onClick={() => setRemoving(null)} disabled={removePending} className="w-full h-11 rounded-lg text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {removing !== null && !removingHasBalance && (
        <ConfirmDialog
          open
          title={`Remove ${removing.name}?`}
          description="Their past expense shares stay on record. Balances adjust automatically."
          confirmLabel="Remove"
          destructive
          busy={removePending}
          onCancel={() => setRemoving(null)}
          onConfirm={() => doRemove(false)}
        />
      )}
    </div>
  )
}

export function GroupDetailPanelEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-8">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Users size={22} strokeWidth={1.6} className="text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold text-foreground">Select a group</p>
      <p className="mt-1.5 text-xs text-muted-foreground max-w-[220px] leading-relaxed">
        Choose a group from the left to see its activity, balances, and settle up.
      </p>
    </div>
  )
}
