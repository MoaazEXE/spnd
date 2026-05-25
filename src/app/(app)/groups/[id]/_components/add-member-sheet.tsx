'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { inviteMemberByEmail } from '@/app/actions/groups'
import { ErrorBanner } from '@/components/ui/error-banner'
import { SheetFrame } from '@/components/ui/sheet-frame'

interface Props {
  groupId: string
  onClose: () => void
}

export function AddMemberSheet({ groupId, onClose }: Props) {
  const [error, action, isPending] = useActionState(inviteMemberByEmail, null)
  const [email, setEmail] = useState('')
  const wasPending = useRef(false)

  useEffect(() => {
    if (wasPending.current && !isPending && error === null) {
      toast.success('Invite sent', {
        description: `${email} will see it in their notifications.`,
      })
      onClose()
    }
    wasPending.current = isPending
  }, [isPending, error, onClose, email])

  return (
    <SheetFrame
      title="Invite by email"
      onClose={onClose}
      size="auto"
      footer={
        <button
          form="add-member-form"
          type="submit"
          disabled={isPending || email.trim().length === 0}
          className="w-full h-14 rounded-xl bg-primary text-primary-foreground text-base font-semibold transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? 'Sending…' : 'Send invite'}
        </button>
      }
    >
      <form action={action} id="add-member-form" className="px-5 pb-5 space-y-4">
        <input type="hidden" name="groupId" value={groupId} />

        <p className="text-sm text-muted-foreground leading-relaxed">
          They need a Settle account already. They&apos;ll see your invite in their
          notifications and can accept or reject — only then do they join the group.
        </p>

        <div className="space-y-2">
          <label
            htmlFor="member-email"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Their email
          </label>
          <input
            id="member-email"
            name="email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="friend@example.com"
            className="w-full h-13 px-4 rounded-lg bg-background border border-border text-base font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          />
        </div>

        <ErrorBanner message={error} />
      </form>
    </SheetFrame>
  )
}
