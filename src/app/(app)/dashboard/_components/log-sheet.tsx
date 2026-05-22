'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { logItem } from '@/app/actions/items'
import { Button } from '@/components/ui/button'
import { fmtRM } from '@/lib/formatters'
import { calculateTimeCost } from '@/core/timecost/timeCost'
import type { TimeCostInput } from '@/types'

const PRESETS = [
  { label: '1 hour',  value: 1,  unit: 'HOURS' },
  { label: '5 hours', value: 5,  unit: 'HOURS' },
  { label: '1 day',   value: 1,  unit: 'DAYS'  },
  { label: '1 week',  value: 7,  unit: 'DAYS'  },
] as const

const inputClass =
  'w-full h-[52px] px-4 rounded-[14px] bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all'

interface Props {
  onClose: () => void
  defaultCoolingPeriod: string
  timeCostContext: Omit<TimeCostInput, 'amountCents'> | null
}

export function LogSheet({ onClose, defaultCoolingPeriod, timeCostContext }: Props) {
  const [error, action, isPending] = useActionState(logItem, null)
  const [amountCents, setAmountCents] = useState(0)
  const [selectedPreset, setSelectedPreset] = useState<number>(() => {
    if (defaultCoolingPeriod === '1h') return 0
    if (defaultCoolingPeriod === '5h') return 1
    if (defaultCoolingPeriod === '1w') return 3
    return 2 // default: 1 day
  })
  const [isCustom, setIsCustom] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const prevError = useRef(error)

  // Close sheet on successful submission (error goes from something/null → null)
  useEffect(() => {
    if (prevError.current !== null && error === null && !isPending) {
      onClose()
    }
    prevError.current = error
  }, [error, isPending, onClose])

  const timeCost =
    timeCostContext && amountCents > 0
      ? calculateTimeCost({ ...timeCostContext, amountCents })
      : null

  const coolingValue = isCustom ? undefined : PRESETS[selectedPreset]?.value
  const coolingUnit = isCustom ? undefined : PRESETS[selectedPreset]?.unit

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      {/* Scrim */}
      <div
        className="absolute inset-0 bg-[rgba(31,42,46,0.4)]"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative bg-background rounded-t-[28px] max-h-[92vh] overflow-y-auto animate-sheet-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center px-5 py-3">
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
            <X size={18} strokeWidth={2} className="text-muted-foreground" />
          </button>
          <h2 className="flex-1 text-center text-[16px] font-semibold tracking-[-0.2px]">Log a temptation</h2>
          <div className="w-9" />
        </div>

        <form ref={formRef} action={action} className="px-5 pb-8 space-y-5">
          {/* Amount hero */}
          <div className="bg-card rounded-[20px] px-5 py-4 text-center shadow-[0_1px_2px_rgba(31,42,46,0.04),0_4px_16px_rgba(31,42,46,0.04)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.4px] text-muted-foreground mb-2">How much?</p>
            <div className="flex items-center justify-center gap-1">
              <span className="text-[24px] font-bold text-muted-foreground">RM</span>
              <input
                name="amount"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                required
                onChange={e => setAmountCents(Math.round(parseFloat(e.target.value || '0') * 100))}
                className="w-40 text-[48px] font-bold text-foreground tabular-nums bg-transparent border-none outline-none text-center placeholder:text-muted-foreground/40"
              />
            </div>
            {timeCost && (
              <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F4ECD8] text-[#A8893E] text-[13px] font-semibold animate-fade-in">
                <span>✦</span>
                <span>≈ {timeCost.formatted} of your life</span>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.4px] text-muted-foreground">
              What is it?
            </label>
            <input name="title" type="text" required placeholder="e.g. New sneakers" className={inputClass} />
          </div>

          {/* Cooling period */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.4px] text-muted-foreground">
              Cooling period
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setSelectedPreset(i); setIsCustom(false) }}
                  className={[
                    'h-10 px-4 rounded-[14px] text-sm font-medium transition-colors',
                    !isCustom && selectedPreset === i
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border text-foreground hover:bg-muted',
                  ].join(' ')}
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className={[
                  'h-10 px-4 rounded-[14px] text-sm font-medium transition-colors',
                  isCustom
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-foreground hover:bg-muted',
                ].join(' ')}
              >
                Custom
              </button>
            </div>

            {/* Hidden inputs for selected preset */}
            {!isCustom && (
              <>
                <input type="hidden" name="coolingValue" value={coolingValue} />
                <input type="hidden" name="coolingUnit" value={coolingUnit} />
              </>
            )}

            {/* Custom input */}
            {isCustom && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  name="coolingValue"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  defaultValue="3"
                  required
                  className="w-20 h-10 px-3 rounded-[14px] bg-background border border-border text-sm text-foreground text-center focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                {(['HOURS', 'DAYS', 'WEEKS'] as const).map(unit => (
                  <label key={unit} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="coolingUnit" value={unit} defaultChecked={unit === 'DAYS'} className="accent-primary" />
                    <span className="text-sm font-medium capitalize">{unit.toLowerCase()}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.4px] text-muted-foreground">
              Note (optional)
            </label>
            <textarea
              name="note"
              placeholder="Why are you tempted? What's the context?"
              rows={3}
              className="w-full px-4 py-3 rounded-[14px] bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>

          {/* Calm reminder */}
          <div className="bg-secondary rounded-[16px] px-4 py-3 flex items-start gap-3">
            <span className="text-primary mt-0.5">🌿</span>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              We&apos;ll quietly hold this. When the time is up, you decide — no pressure either way.
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-[10px]">{error}</p>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-12 rounded-[14px] text-sm font-semibold"
          >
            {isPending ? 'Starting cool…' : 'Start cooling'}
          </Button>
        </form>
      </div>
    </div>
  )
}
