'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { updateProfile } from '@/app/actions/users'
import { ErrorBanner } from '@/components/ui/error-banner'
import { SheetFrame } from '@/components/ui/sheet-frame'

interface Props {
  initialName: string
  email: string
  onClose: () => void
}

export function EditProfileSheet({ initialName, email, onClose }: Props) {
  const [error, action, isPending] = useActionState(updateProfile, null)
  const [name, setName] = useState(initialName)
  const wasPending = useRef(false)

  useEffect(() => {
    if (wasPending.current && !isPending && error === null) {
      toast.success('Profile updated')
      onClose()
    }
    wasPending.current = isPending
  }, [isPending, error, onClose])

  const dirty = name.trim() !== initialName && name.trim().length > 0

  return (
    <SheetFrame
      title="Edit profile"
      onClose={onClose}
      size="auto"
      footer={
        <button
          form="edit-profile-form"
          type="submit"
          disabled={isPending || !dirty}
          className="w-full h-14 rounded-xl bg-primary text-primary-foreground text-base font-semibold transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? 'Saving…' : 'Save changes'}
        </button>
      }
    >
      <form action={action} id="edit-profile-form" className="px-5 pb-5 space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="profile-name"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Display name
          </label>
          <input
            id="profile-name"
            name="name"
            type="text"
            required
            maxLength={60}
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full h-13 px-4 rounded-lg bg-background border border-border text-base font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          />
          <p className="text-[11px] text-muted-foreground">
            Shown to other group members and on your dashboard greeting.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Email
          </label>
          <div className="w-full h-13 px-4 rounded-lg bg-muted border border-border text-base font-medium text-muted-foreground flex items-center">
            {email}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Tied to your sign-in. Change it from your auth provider.
          </p>
        </div>

        <ErrorBanner message={error} />
      </form>
    </SheetFrame>
  )
}
