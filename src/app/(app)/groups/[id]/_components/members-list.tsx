'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { UserMinus } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useFmt } from '@/lib/currency-context'
import { cn } from '@/lib/utils'
import { kickMember, removeGuestMember } from '@/app/actions/groups'
import type { GroupMemberView, GroupGuestView } from '../page'

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
  const [removing, setRemoving] = useState<{ type: 'member' | 'guest'; id: string; name: string } | null>(null)

  function doRemove() {
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
        router.refresh()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Could not remove.'
        if (!msg.includes('NEXT_REDIRECT')) toast.error(msg)
      } finally {
        setRemoving(null)
      }
    })
  }

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
                onClick={() => setRemoving({ type: 'member', id: m.id, name: m.name })}
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
                onClick={() => setRemoving({ type: 'guest', id: g.id, name: g.name })}
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

      <ConfirmDialog
        open={removing !== null}
        title={`Remove ${removing?.name ?? ''}?`}
        description="Their past expense shares stay on record. Balances adjust automatically."
        confirmLabel="Remove"
        destructive
        busy={pending}
        onCancel={() => setRemoving(null)}
        onConfirm={doRemove}
      />
    </>
  )
}
