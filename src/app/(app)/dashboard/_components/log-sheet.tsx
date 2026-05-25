'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { logItem } from '@/app/actions/items'
import { calculateTimeCost } from '@/core/timecost/timeCost'
import { Card } from '@/components/ui/card'
import { ErrorBanner } from '@/components/ui/error-banner'
import { SheetFrame } from '@/components/ui/sheet-frame'
import { cn } from '@/lib/utils'
import type { TimeCostInput } from '@/types'

const PRESETS = [
  { label: '30 mins', value: 30, unit: 'MINUTES' },
  { label: '1 hour', value: 1, unit: 'HOURS' },
  { label: '5 hours', value: 5, unit: 'HOURS' },
  { label: '1 day', value: 1, unit: 'DAYS' },
  { label: '1 week', value: 7, unit: 'DAYS' },
] as const

const INPUT =
  'w-full h-13 px-4 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors'
const LABEL = 'text-xs font-semibold uppercase tracking-wide text-muted-foreground'

interface Props {
  onClose: () => void
  defaultCoolingPeriod: string
  timeCostContext: Omit<TimeCostInput, 'amountCents'> | null
}

function presetIndexForStored(stored: string): number {
  if (stored === '30m') return 0
  if (stored === '1h') return 1
  if (stored === '5h') return 2
  if (stored === '1w') return 4
  return 3
}

export function LogSheet({ onClose, defaultCoolingPeriod, timeCostContext }: Props) {
  const [error, action, isPending] = useActionState(logItem, null)
  const [amountCents, setAmountCents] = useState(0)
  const [title, setTitle] = useState('')
  const [selectedPreset, setSelectedPreset] = useState(() => presetIndexForStored(defaultCoolingPeriod))
  const [isCustom, setIsCustom] = useState(false)
  const wasPending = useRef(false)

  useEffect(() => {
    if (wasPending.current && !isPending && error === null) {
      toast.success(`${title || 'Temptation'} is cooling`, {
        description: "We'll quietly hold this until your time is up.",
      })
      onClose()
    }
    wasPending.current = isPending
  }, [isPending, error, onClose, title])

  const timeCost =
    timeCostContext && amountCents > 0
      ? calculateTimeCost({ ...timeCostContext, amountCents })
      : null

  const coolingValue = isCustom ? undefined : PRESETS[selectedPreset]?.value
  const coolingUnit = isCustom ? undefined : PRESETS[selectedPreset]?.unit
  const canSubmit = title.trim().length > 0 && amountCents > 0

  return (
    <SheetFrame
      title="Log a temptation"
      onClose={onClose}
      size="tall"
      footer={
        <button
          form="log-form"
          type="submit"
          disabled={isPending || !canSubmit}
          className="w-full h-14 rounded-xl bg-primary text-primary-foreground text-base font-semibold transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? 'Starting cool…' : 'Start cooling'}
        </button>
      }
    >
      <form action={action} id="log-form" className="px-5 pb-4 space-y-5">
        <Card className="text-center" padding="md">
          <p className={cn(LABEL, 'mb-2')}>How much?</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-2xl font-semibold text-muted-foreground tracking-tight">RM</span>
            <input
              name="amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              placeholder="0"
              required
              onChange={e =>
                setAmountCents(Math.round(parseFloat(e.target.value || '0') * 100))
              }
              className="w-44 text-center text-5xl font-bold text-foreground tabular-nums tracking-tight bg-transparent border-none outline-none placeholder:text-muted-foreground/40"
            />
          </div>
          {timeCost && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold-tint text-gold-deep text-xs font-semibold animate-fade-in">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 3l1.8 5.4L19 10.2 13.8 12 12 17.4 10.2 12 5 10.2l5.2-1.8L12 3z" />
              </svg>
              ≈ {timeCost.formatted} of your life
            </div>
          )}
        </Card>

        <div className="space-y-2">
          <label className={LABEL}>What is it?</label>
          <input
            name="title"
            type="text"
            required
            placeholder="e.g. New sneakers"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className={INPUT}
          />
        </div>

        <div className="space-y-2">
          <label className={LABEL}>Cooling period</label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset, i) => (
              <PresetButton
                key={i}
                active={!isCustom && selectedPreset === i}
                onClick={() => {
                  setSelectedPreset(i)
                  setIsCustom(false)
                }}
              >
                {preset.label}
              </PresetButton>
            ))}
            <PresetButton active={isCustom} onClick={() => setIsCustom(true)}>
              Custom
            </PresetButton>
          </div>

          {!isCustom && (
            <>
              <input type="hidden" name="coolingValue" value={coolingValue} />
              <input type="hidden" name="coolingUnit" value={coolingUnit} />
            </>
          )}

          {isCustom && (
            <div className="mt-2 flex items-center gap-2 bg-card rounded-lg px-4 py-3">
              <input
                name="coolingValue"
                type="number"
                inputMode="numeric"
                min="1"
                defaultValue="3"
                required
                className="w-16 h-9 px-2 rounded-sm bg-background border border-border text-sm font-semibold text-foreground text-center focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {(['MINUTES', 'HOURS', 'DAYS', 'WEEKS'] as const).map(unit => (
                <label
                  key={unit}
                  className="h-9 px-3 rounded-sm text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="coolingUnit"
                    value={unit}
                    defaultChecked={unit === 'DAYS'}
                    className="accent-primary"
                  />
                  <span className="capitalize">{unit.toLowerCase()}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className={LABEL}>Note (optional)</label>
          <textarea
            name="note"
            placeholder="Why are you tempted? What's the context?"
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-background border border-border text-base font-medium text-foreground placeholder:text-muted-foreground/50 leading-relaxed focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors resize-none"
          />
        </div>

        <div className="flex items-start gap-3 bg-primary-tint rounded-lg px-4 py-3.5">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className="mt-0.5 flex-shrink-0 text-primary-deep"
          >
            <path d="M20 4c-9 0-15 5-15 12 0 2 .8 3.5 1.5 4.5 1-7 6-11 13-12-.5 7-5 12-12 13 1 .8 2.5 1.5 4.5 1.5 7 0 12-6 12-15V4h-4z" />
          </svg>
          <p className="text-xs text-primary-deep leading-relaxed">
            We&apos;ll quietly hold this. When the time is up, you decide — no pressure either way.
          </p>
        </div>

        <ErrorBanner message={error} />
      </form>
    </SheetFrame>
  )
}

function PresetButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-10 px-4 rounded-lg text-sm font-semibold transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-card border border-border text-foreground hover:bg-muted',
      )}
    >
      {children}
    </button>
  )
}
