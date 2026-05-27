'use client'

import { useActionState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createGroup } from '@/app/actions/groups'
import { ErrorBanner } from '@/components/ui/error-banner'
import { SheetFrame } from '@/components/ui/sheet-frame'

interface Props {
  onClose: () => void
  onCreated?: (newGroupId: string) => void
}

export function CreateGroupSheet({ onClose, onCreated }: Props) {
  const [state, action, isPending] = useActionState(createGroup, null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // The action returns either an error message or a JSON payload `{"id":"..."}`.
  // Detect which by trying to parse — keeps the action signature simple.
  const { error, createdId } = useMemo(() => {
    if (!state) return { error: null as string | null, createdId: null as string | null }
    if (state.startsWith('{')) {
      try {
        const parsed = JSON.parse(state) as { id?: string }
        return { error: null, createdId: parsed.id ?? null }
      } catch {
        return { error: state, createdId: null }
      }
    }
    return { error: state, createdId: null }
  }, [state])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // After successful creation, route to the right place for the current viewport.
  // Desktop (>=1024px) stays on /groups and auto-selects the new group via the
  // onCreated callback. Mobile navigates into the group detail page.
  useEffect(() => {
    if (!createdId) return
    const isDesktop = typeof window !== 'undefined'
      && window.matchMedia('(min-width: 1024px)').matches
    if (isDesktop && onCreated) {
      onCreated(createdId)
      router.refresh()
      onClose()
    } else {
      router.push(`/groups/${createdId}`)
    }
  }, [createdId, onCreated, onClose, router])

  return (
    <SheetFrame
      title="New group"
      onClose={onClose}
      size="auto"
      footer={
        <button
          form="create-group-form"
          type="submit"
          disabled={isPending}
          className="w-full h-14 rounded-xl bg-primary text-primary-foreground text-base font-semibold transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? 'Creating…' : 'Create group'}
        </button>
      }
    >
      <form action={action} id="create-group-form" className="px-5 pb-5 space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          A space to split real expenses with friends, or cool on something together before
          everyone commits.
        </p>

        <div className="space-y-2">
          <label
            htmlFor="group-name"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Group name
          </label>
          <input
            id="group-name"
            ref={inputRef}
            name="name"
            type="text"
            required
            maxLength={60}
            placeholder="e.g. Tokyo trip, Flat 3B"
            className="w-full h-13 px-4 rounded-lg bg-background border border-border text-base font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          />
        </div>

        <ErrorBanner message={error} />
      </form>
    </SheetFrame>
  )
}
