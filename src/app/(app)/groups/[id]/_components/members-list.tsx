'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { UserMinus, AlertTriangle, X } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useFmt } from '@/lib/currency-context'
import { cn } from '@/lib/utils'
import { kickMember, removeGuestMember } from '@/app/actions/groups'
import type { GroupMemberView, GroupGuestView } from '../page'

interface RemovingState {
  type: 'member' | 'guest'
  id: string
  name: string
  balanceCents: number
}

interface Props {
  members: GroupMemberView[]
  guests: GroupGuestView[]
  isCreator?: boolean
  currentUserId?: string
  groupId?: string
  onAddMember: () => void
}

export function MembersList({ members, guests, isCreator, currentUserId, groupId, onAddMember }: Props) {
  const fmt = useFmt()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [removing, setRemoving] = useState<RemovingState | null>(null)

  function doRemove(andResplit: boolean) {
    if (!removing) return
    startTransition(async () => {
      try {
        const fd = new FormData()
        if (removing.type === 'member') {
          fd.set('groupId', groupId ?? '')
          fd.set('memberId', removing.id)
          await kickMember(fd)
        } else {
          fd.set('guestId', removing.id)
          await removeGuestMember(fd)
        }
        toast.success(`${removing.name} removed from group`)
        setRemoving(null)
        if (andResplit && groupId) {
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

  const hasBalance = Math.abs(removing?.balanceCents ?? 0) > 0

  return (
    <>
      <Card padding="none">
        {members.map((m, i) => (
          <div
            key={m.id}
            className={cn(
              'flex items-center gap-3.5 px-4 py-3.5',
              (i < members.length - 1 || guests.length > 0) && 'border-b border-sep',
            )}
          >
            <Avatar name={m.name} src={m.avatarUrl} size={36} />
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
                : (m.balanceCents > 0 ? '+' : '−') + fmt(Math.abs(m.balanceCents), 0)}
            </p>
            {isCreator && m.id !== currentUserId && (
              <button
                type="button"
                onClick={() => setRemoving({ type: 'member', id: m.id, name: m.name, balanceCents: m.balanceCents })}
                disabled={pending}
                className="ml-0.5 w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-coral-deep hover:bg-coral-tint transition-colors flex-shrink-0"
                aria-label={`Remove ${m.name}`}
              >
                <UserMinus size={15} strokeWidth={1.8} />
              </button>
            )}
          </div>
        ))}

        {guests.map((g, i) => (
          <div
            key={g.id}
            className={cn(
              'flex items-center gap-3.5 px-4 py-3.5',
              i < guests.length - 1 && 'border-b border-sep',
            )}
          >
            <Avatar name={g.name} size={36} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{g.name}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Guest</p>
            </div>
            {(isCreator || g.addedBy === currentUserId) && (
              <button
                type="button"
                onClick={() => setRemoving({ type: 'guest', id: g.id, name: g.name, balanceCents: g.balanceCents })}
                disabled={pending}
                className="ml-0.5 w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-coral-deep hover:bg-coral-tint transition-colors flex-shrink-0"
                aria-label={`Remove ${g.name}`}
              >
                <UserMinus size={15} strokeWidth={1.8} />
              </button>
            )}
          </div>
        ))}
      </Card>

      <button
        type="button"
        onClick={onAddMember}
        className="mt-3 w-full rounded-2xl border-[1.5px] border-dashed border-sep-strong px-4 py-3 text-sm font-semibold text-primary hover:bg-card transition-colors"
      >
        + Add member
      </button>

      {/* Dialog for member with outstanding balance — 3 choices */}
      {removing !== null && hasBalance && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-foreground/45 backdrop-blur-sm animate-fade-in"
            onClick={pending ? undefined : () => setRemoving(null)}
          />
          <div className="relative w-full max-w-[420px] bg-card rounded-2xl shadow-pop animate-pop overflow-hidden">
            <button
              type="button"
              onClick={() => setRemoving(null)}
              disabled={pending}
              aria-label="Close"
              className="absolute top-2 right-2 w-11 h-11 lg:w-9 lg:h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              <X size={16} strokeWidth={2} />
            </button>
            <div className="px-6 pt-7 pb-5">
              <div className="mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center bg-coral-tint text-coral-deep">
                <AlertTriangle size={20} strokeWidth={1.8} />
              </div>
              <h2 className="text-center text-base font-semibold text-foreground">
                Remove {removing.name}?
              </h2>
              <p className="mt-2 text-center text-sm text-muted-foreground leading-relaxed">
                {removing.name} has an outstanding balance of{' '}
                <span className="font-semibold text-foreground">{fmt(Math.abs(removing.balanceCents), 0)}</span>.
                {' '}Their past shares stay on record. You can re-split all activity equally
                across the remaining members, or keep the current split as-is.
              </p>
            </div>
            <div className="px-6 pb-6 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => doRemove(true)}
                disabled={pending}
                className="w-full h-11 rounded-lg bg-coral-deep text-white text-sm font-semibold hover:bg-coral-deep/90 transition-colors active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {pending ? '…' : 'Remove & re-split equally'}
              </button>
              <button
                type="button"
                onClick={() => doRemove(false)}
                disabled={pending}
                className="w-full h-11 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                Remove only
              </button>
              <button
                type="button"
                onClick={() => setRemoving(null)}
                disabled={pending}
                className="w-full h-11 rounded-lg text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simple confirm for member with zero balance */}
      {removing !== null && !hasBalance && (
        <ConfirmDialog
          open
          title={`Remove ${removing.name}?`}
          description="Their past expense shares stay on record. Balances adjust automatically."
          confirmLabel="Remove"
          destructive
          busy={pending}
          onCancel={() => setRemoving(null)}
          onConfirm={() => doRemove(false)}
        />
      )}
    </>
  )
}
