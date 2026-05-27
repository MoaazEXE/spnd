'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { UserPlus } from 'lucide-react'
import { inviteMember, addGuestMember } from '@/app/actions/groups'
import { ErrorBanner } from '@/components/ui/error-banner'
import { SheetFrame } from '@/components/ui/sheet-frame'
import { cn } from '@/lib/utils'

interface Props {
  groupId: string
  initialMode?: 'invite' | 'guest'
  onClose: () => void
}

export function AddMemberSheet({ groupId, initialMode = 'invite', onClose }: Props) {
  const router = useRouter()
  const [mode, setMode] = useState<'invite' | 'guest'>(initialMode)
  const [identifier, setIdentifier] = useState('')
  const [guestName, setGuestName] = useState('')

  const [inviteError, inviteAction, invitePending] = useActionState(inviteMember, null)
  const [guestError, guestAction, guestPending] = useActionState(addGuestMember, null)

  const wasInvitePending = useRef(false)
  const wasGuestPending = useRef(false)

  useEffect(() => {
    if (wasInvitePending.current && !invitePending && inviteError === null) {
      toast.success('Invite sent', {
        description: `${identifier} will see it in their notifications.`,
      })
      router.refresh()
      onClose()
    }
    wasInvitePending.current = invitePending
  }, [invitePending, inviteError, onClose, identifier, router])

  useEffect(() => {
    if (wasGuestPending.current && !guestPending && guestError === null) {
      toast.success(`${guestName || 'Guest'} added to group`)
      router.refresh()
      onClose()
    }
    wasGuestPending.current = guestPending
  }, [guestPending, guestError, onClose, guestName, router])

  const isPending = invitePending || guestPending
  const canSubmit =
    mode === 'invite' ? identifier.trim().length > 0 : guestName.trim().length > 0

  return (
    <SheetFrame
      title="Add member"
      onClose={onClose}
      size="auto"
      footer={
        <button
          form={mode === 'invite' ? 'add-invite-form' : 'add-guest-form'}
          type="submit"
          disabled={isPending || !canSubmit}
          className="w-full h-14 rounded-xl bg-primary text-primary-foreground text-base font-semibold transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? '…' : mode === 'invite' ? 'Send invite' : 'Add guest'}
        </button>
      }
    >
      <div className="px-5 pb-5 space-y-5">
        <div className="bg-muted rounded-xl p-1 flex gap-1">
          <button
            type="button"
            onClick={() => setMode('invite')}
            className={cn(
              'flex-1 h-9 rounded-lg text-sm font-semibold transition-colors',
              mode === 'invite'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            By email / username
          </button>
          <button
            type="button"
            onClick={() => setMode('guest')}
            className={cn(
              'flex-1 h-9 rounded-lg text-sm font-semibold transition-colors',
              mode === 'guest'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Guest (no account)
          </button>
        </div>

        {mode === 'invite' ? (
          <form action={inviteAction} id="add-invite-form" className="space-y-4">
            <input type="hidden" name="groupId" value={groupId} />
            <p className="text-sm text-muted-foreground leading-relaxed">
              They need a Settle account. They&apos;ll get a notification and can accept or reject.
            </p>
            <div className="space-y-2">
              <label
                htmlFor="member-identifier"
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Email or @username
              </label>
              <input
                id="member-identifier"
                name="identifier"
                type="text"
                required
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="friend@example.com or @username"
                autoFocus
                className="w-full h-13 px-4 rounded-lg bg-background border border-border text-base font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>
            <ErrorBanner message={inviteError} />
          </form>
        ) : (
          <form action={guestAction} id="add-guest-form" className="space-y-4">
            <input type="hidden" name="groupId" value={groupId} />
            <div className="rounded-lg bg-coral-tint px-4 py-3.5">
              <p className="text-xs text-coral-deep leading-relaxed font-semibold">
                Heads up — guest mode isn&apos;t perfect.
              </p>
              <p className="mt-1 text-xs text-coral-deep/90 leading-relaxed">
                Settle works best when everyone has their own account. Guests can&apos;t see balances,
                accept invites, or confirm payments themselves — their share is tracked under your
                name and you&apos;re responsible for collecting from them outside the app. Invite
                them by email if you can.
              </p>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="guest-name"
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Guest name
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <UserPlus size={16} strokeWidth={1.8} />
                </span>
                <input
                  id="guest-name"
                  name="guestName"
                  type="text"
                  required
                  maxLength={60}
                  placeholder="e.g. Sarah (friend)"
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  autoFocus
                  className="w-full h-13 pl-11 pr-4 rounded-lg bg-background border border-border text-base font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </div>
            </div>
            <ErrorBanner message={guestError} />
          </form>
        )}
      </div>
    </SheetFrame>
  )
}
