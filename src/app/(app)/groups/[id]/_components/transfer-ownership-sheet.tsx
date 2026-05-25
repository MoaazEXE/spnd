'use client'

import { useState, useTransition } from 'react'
import { Check, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar } from '@/components/ui/avatar'
import { SheetFrame } from '@/components/ui/sheet-frame'
import { transferOwnership } from '@/app/actions/groups'
import { cn } from '@/lib/utils'
import type { GroupMemberView } from '../page'

interface Props {
  groupId: string
  groupName: string
  currentUserId: string
  members: GroupMemberView[]
  onClose: () => void
}

export function TransferOwnershipSheet({
  groupId,
  groupName,
  currentUserId,
  members,
  onClose,
}: Props) {
  const candidates = members.filter(m => m.id !== currentUserId)
  const [picked, setPicked] = useState<string | null>(candidates[0]?.id ?? null)
  const [pending, startTransition] = useTransition()

  function submit() {
    if (!picked) return
    startTransition(async () => {
      try {
        const fd = new FormData()
        fd.set('groupId', groupId)
        fd.set('newOwnerId', picked)
        await transferOwnership(fd)
        toast.success('Ownership transferred', {
          description: `${members.find(m => m.id === picked)?.name ?? 'They'} now owns ${groupName}.`,
        })
        onClose()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Transfer failed.'
        if (!msg.includes('NEXT_REDIRECT')) toast.error(msg)
      }
    })
  }

  return (
    <SheetFrame
      title="Transfer ownership"
      onClose={onClose}
      size="auto"
      footer={
        <button
          type="button"
          onClick={submit}
          disabled={pending || !picked}
          className="w-full h-14 rounded-xl bg-primary text-primary-foreground text-base font-semibold transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {pending ? 'Transferring…' : 'Transfer'}
        </button>
      }
    >
      <div className="px-5 pb-5 space-y-4">
        <div className="flex items-start gap-3 bg-primary-tint rounded-2xl p-4">
          <Shield
            size={18}
            strokeWidth={1.8}
            className="text-primary-deep mt-0.5 flex-shrink-0"
          />
          <p className="text-xs text-primary-deep leading-relaxed">
            The new owner can invite, delete, and transfer the group themselves. You stay a
            regular member and can leave whenever.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {candidates.map(m => {
            const checked = picked === m.id
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setPicked(m.id)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-3 border transition-colors text-left',
                  checked
                    ? 'border-primary bg-primary-tint'
                    : 'border-border bg-card hover:bg-muted',
                )}
              >
                <Avatar name={m.name} size={36} />
                <span className="flex-1 min-w-0 text-sm font-semibold text-foreground truncate">
                  {m.name}
                </span>
                <span
                  className={cn(
                    'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center',
                    checked ? 'bg-primary text-primary-foreground' : 'border border-border',
                  )}
                >
                  {checked && <Check size={12} strokeWidth={2.5} />}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </SheetFrame>
  )
}
