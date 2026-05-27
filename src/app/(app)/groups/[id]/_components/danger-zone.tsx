'use client'

import { useState, useTransition } from 'react'
import { LogOut, Trash2, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { leaveGroup, deleteGroup } from '@/app/actions/groups'
import { useFmt } from '@/lib/currency-context'
import type { GroupMemberView } from '../page'

interface Props {
  groupId: string
  groupName: string
  isCreator: boolean
  youBalanceCents: number
  members: GroupMemberView[]
  currentUserId: string
  onTransferRequest: () => void
  /**
   * Optional callback fired after a successful delete/leave. Used by the desktop
   * two-pane layout to clear the selected group id so the right panel doesn't
   * show stale data (and a second click on "Delete" doesn't hit a vanished id).
   */
  onAfterRemoved?: () => void
}

export function DangerZone({
  groupId,
  groupName,
  isCreator,
  youBalanceCents,
  members,
  currentUserId,
  onTransferRequest,
  onAfterRemoved,
}: Props) {
  const fmt = useFmt()
  const [pending, startTransition] = useTransition()
  const [mode, setMode] = useState<'leave' | 'delete' | null>(null)

  const otherActiveMembers = members.filter(m => m.id !== currentUserId)

  function doLeave() {
    startTransition(async () => {
      let succeeded = false
      try {
        const fd = new FormData()
        fd.set('groupId', groupId)
        await leaveGroup(fd)
        toast.success(`You left ${groupName}`)
        succeeded = true
      } catch (err) {
        // Server actions surface errors as redirects/thrown — we can't read
        // a message safely, so fall back to a generic toast.
        const msg = err instanceof Error ? err.message : 'Could not leave group.'
        if (msg.includes('NEXT_REDIRECT')) {
          succeeded = true
        } else {
          toast.error(msg)
        }
      } finally {
        setMode(null)
        if (succeeded) onAfterRemoved?.()
      }
    })
  }

  function doDelete() {
    startTransition(async () => {
      let succeeded = false
      try {
        const fd = new FormData()
        fd.set('groupId', groupId)
        await deleteGroup(fd)
        toast.success(`Deleted ${groupName}`)
        succeeded = true
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Could not delete group.'
        if (msg.includes('NEXT_REDIRECT')) {
          succeeded = true
        } else {
          toast.error(msg)
        }
      } finally {
        setMode(null)
        if (succeeded) onAfterRemoved?.()
      }
    })
  }

  const leaveDescription =
    youBalanceCents !== 0
      ? `Your balance is ${
          youBalanceCents > 0 ? '+' : '−'
        }${fmt(Math.abs(youBalanceCents), 0)}. Past splits stay on file, but settling first is kinder.`
      : 'You won’t see this group anymore. Past splits stay on file.'

  return (
    <div className="mt-8">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-coral-deep/70 mb-2">
        Danger zone
      </p>
      <Card padding="none">
        {!isCreator && (
          <button
            type="button"
            onClick={() => setMode('leave')}
            disabled={pending}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-coral-tint/50 transition-colors disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-lg bg-coral-tint text-coral-deep flex items-center justify-center flex-shrink-0">
              <LogOut size={16} strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-coral-deep">Leave group</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                You won’t see this group anymore. Past splits stay on file.
              </p>
            </div>
          </button>
        )}

        {isCreator && otherActiveMembers.length > 0 && (
          <button
            type="button"
            onClick={onTransferRequest}
            disabled={pending}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted transition-colors disabled:opacity-50 border-b border-sep"
          >
            <div className="w-9 h-9 rounded-lg bg-primary-tint text-primary-deep flex items-center justify-center flex-shrink-0">
              <Shield size={16} strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Transfer ownership</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Hand the group to another member so you can leave it.
              </p>
            </div>
          </button>
        )}

        {isCreator && (
          <button
            type="button"
            onClick={() => setMode('delete')}
            disabled={pending}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-coral-tint/50 transition-colors disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-lg bg-coral-tint text-coral-deep flex items-center justify-center flex-shrink-0">
              <Trash2 size={16} strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-coral-deep">Delete group</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Permanent. Removes every expense for every member.
              </p>
            </div>
          </button>
        )}
      </Card>

      {isCreator && otherActiveMembers.length === 0 && (
        <p className="mt-2 text-[11px] text-subtle-foreground">
          As the only member, you can only delete. Invite someone to enable ownership
          transfer.
        </p>
      )}

      <ConfirmDialog
        open={mode === 'leave'}
        title={`Leave "${groupName}"?`}
        description={leaveDescription}
        confirmLabel="Leave group"
        destructive
        busy={pending}
        onCancel={() => setMode(null)}
        onConfirm={doLeave}
      />
      <ConfirmDialog
        open={mode === 'delete'}
        title={`Delete "${groupName}"?`}
        description="This removes the group and every expense in it for all members. There's no undo."
        confirmLabel="Delete group"
        destructive
        busy={pending}
        requireText={groupName}
        onCancel={() => setMode(null)}
        onConfirm={doDelete}
      />
    </div>
  )
}
