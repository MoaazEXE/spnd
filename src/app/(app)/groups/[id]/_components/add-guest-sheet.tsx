'use client'

import { useActionState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { UserPlus } from 'lucide-react'
import { addGuestMember } from '@/app/actions/groups'
import { ErrorBanner } from '@/components/ui/error-banner'
import { SheetFrame } from '@/components/ui/sheet-frame'

interface Props {
  groupId: string
  onClose: () => void
}

export function AddGuestSheet({ groupId, onClose }: Props) {
  const [error, action, isPending] = useActionState(addGuestMember, null)
  const wasPending = useRef(false)

  useEffect(() => {
    if (wasPending.current && !isPending && error === null) {
      toast.success('Guest added to group')
      onClose()
    }
    wasPending.current = isPending
  }, [isPending, error, onClose])

  return (
    <SheetFrame
      title="Add guest member"
      onClose={onClose}
      footer={
        <button
          form="add-guest-form"
          type="submit"
          disabled={isPending}
          className="w-full h-14 rounded-xl bg-primary text-primary-foreground text-base font-semibold transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? 'Adding…' : 'Add guest'}
        </button>
      }
    >
      <form action={action} id="add-guest-form" className="px-5 pb-4 space-y-5">
        <input type="hidden" name="groupId" value={groupId} />

        <div className="rounded-lg bg-primary-tint px-4 py-3.5">
          <p className="text-xs text-primary-deep leading-relaxed">
            Guests don&apos;t need a Settle account. Their debts are tracked under your name —
            you&apos;re responsible for collecting from them outside the app.
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
              className="w-full h-13 pl-11 pr-4 rounded-lg bg-background border border-border text-base font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            />
          </div>
        </div>

        <ErrorBanner message={error} />
      </form>
    </SheetFrame>
  )
}
