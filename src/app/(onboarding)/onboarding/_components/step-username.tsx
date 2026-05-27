'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { checkUsernameAvailable } from '@/app/actions/users'
import { validateUsername, normalizeUsername } from '@/lib/username'
import { BrandMark } from '@/components/ui/brand-mark'
import { OnboardingStepper } from './onboarding-stepper'

interface Props {
  suggestedUsername: string
  value: string
  onChange: (value: string) => void
  onNext: () => void
}

type AvailabilityState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'available' }
  | { status: 'unavailable'; reason: string }

export function StepUsername({ suggestedUsername, value, onChange, onNext }: Props) {
  const [availability, setAvailability] = useState<AvailabilityState>({ status: 'idle' })
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const normalized = normalizeUsername(value)
  const localValidation = validateUsername(normalized)

  useEffect(() => {
    if (!value.trim()) {
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

  const canProceed = availability.status === 'available'

  return (
    <div>
      <div className="mb-8">
        <BrandMark size="md" />
      </div>

      <OnboardingStepper currentStep={0} totalSteps={3} />

      <div className="mb-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
          Step 1 of 3
        </p>
        <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-tight text-foreground">
          Choose your username
        </h1>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          Others can find you with @username. You can change it later.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-base select-none">
              @
            </span>
            <input
              type="text"
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder={suggestedUsername}
              autoFocus
              autoComplete="username"
              maxLength={20}
              className="w-full h-14 pl-8 pr-12 rounded-xl bg-muted/50 border border-border text-base font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
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
          {availability.status === 'idle' && (
            <p className="text-xs text-muted-foreground px-1">
              3–20 characters. Letters, numbers, and underscores only.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="w-full h-14 rounded-xl bg-primary text-primary-foreground text-base font-semibold transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
