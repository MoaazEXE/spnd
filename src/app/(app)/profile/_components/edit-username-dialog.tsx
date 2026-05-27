'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { updateUsername, checkUsernameAvailable } from '@/app/actions/users'
import { validateUsername, normalizeUsername } from '@/lib/username'
import { ErrorBanner } from '@/components/ui/error-banner'
import { SheetFrame } from '@/components/ui/sheet-frame'

interface Props {
  currentUsername: string | null
  usernameUpdatedAt: Date | null
  onClose: () => void
}

type AvailabilityState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'available' }
  | { status: 'unavailable'; reason: string }

function msUntilNextChange(updatedAt: Date | null): number {
  if (!updatedAt) return 0
  return Math.max(0, 24 * 60 * 60 * 1000 - (Date.now() - updatedAt.getTime()))
}

function fmtCooldown(ms: number): string {
  const h = Math.floor(ms / 3600000)
  const m = Math.ceil((ms % 3600000) / 60000)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function EditUsernameDialog({ currentUsername, usernameUpdatedAt, onClose }: Props) {
  const router = useRouter()
  const cooldownMs = msUntilNextChange(usernameUpdatedAt)
  const isLocked = cooldownMs > 0

  const [value, setValue] = useState(currentUsername ?? '')
  const [availability, setAvailability] = useState<AvailabilityState>({ status: 'idle' })
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [error, submitAction, isPending] = useActionState(updateUsername, null)

  const normalized = normalizeUsername(value)
  const localValidation = validateUsername(normalized)

  useEffect(() => {
    if (!value.trim() || normalized === currentUsername?.toLowerCase()) {
      setAvailability({ status: 'idle' })
      return
    }
    if (!localValidation.ok) {
      setAvailability({ status: 'unavailable', reason: localValidation.reason })
      return
    }

    setAvailability({ status: 'checking' })
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const result = await checkUsernameAvailable(value)
      if (result.available) {
        setAvailability({ status: 'available' })
      } else {
        setAvailability({ status: 'unavailable', reason: result.reason ?? 'Not available.' })
      }
    }, 400)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const wasPending = useRef(false)
  useEffect(() => {
    if (wasPending.current && !isPending && error === null) {
      toast.success('Username updated')
      router.refresh()
      onClose()
    }
    wasPending.current = isPending
  }, [isPending, error, onClose, router])

  const canSubmit = !isLocked && availability.status === 'available' && normalized !== (currentUsername?.toLowerCase() ?? '')

  return (
    <SheetFrame title="Change username" onClose={onClose} size="auto">
      <div className="px-5 pb-5 space-y-5">
        {isLocked && (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 px-4 py-3">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Cooldown active
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              You can change your username again in {fmtCooldown(cooldownMs)}.
            </p>
          </div>
        )}

        <form action={submitAction} id="username-form" className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="new-username"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              New username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-base select-none">
                @
              </span>
              <input
                id="new-username"
                name="username"
                type="text"
                value={value}
                onChange={e => setValue(e.target.value)}
                disabled={isLocked}
                placeholder={currentUsername ?? 'username'}
                maxLength={20}
                autoFocus={!isLocked}
                className="w-full h-13 pl-8 pr-12 rounded-lg bg-background border border-border text-base font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {availability.status === 'checking' && (
                  <Loader2 size={18} className="animate-spin text-muted-foreground" />
                )}
                {availability.status === 'available' && (
                  <CheckCircle2 size={18} className="text-green-500" />
                )}
                {availability.status === 'unavailable' && value.trim() && (
                  <XCircle size={18} className="text-destructive" />
                )}
              </div>
            </div>
            {availability.status === 'unavailable' && value.trim() && (
              <p className="text-xs text-destructive px-1">{availability.reason}</p>
            )}
            {availability.status === 'available' && (
              <p className="text-xs text-green-600 px-1">@{normalized} is available!</p>
            )}
            {availability.status === 'idle' && !isLocked && (
              <p className="text-xs text-muted-foreground px-1">
                You can change your username once every 24 hours.
              </p>
            )}
          </div>
          <ErrorBanner message={error} />
        </form>

        <button
          form="username-form"
          type="submit"
          disabled={isPending || !canSubmit}
          className="w-full h-14 rounded-xl bg-primary text-primary-foreground text-base font-semibold transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? '…' : 'Save username'}
        </button>
      </div>
    </SheetFrame>
  )
}
