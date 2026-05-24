'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { logItem } from '@/app/actions/items'
import { fmtRM } from '@/lib/formatters'
import { calculateTimeCost } from '@/core/timecost/timeCost'
import type { TimeCostInput } from '@/types'

const PRESETS = [
  { label: '30 mins', value: 30, unit: 'MINUTES' },
  { label: '1 hour',  value: 1,  unit: 'HOURS'   },
  { label: '5 hours', value: 5,  unit: 'HOURS'   },
  { label: '1 day',   value: 1,  unit: 'DAYS'    },
  { label: '1 week',  value: 7,  unit: 'DAYS'    },
] as const

const inputClass =
  'w-full h-[52px] px-4 rounded-[14px] bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all'

const labelClass = 'text-[13px] font-semibold uppercase tracking-[0.2px] text-[var(--text-muted)]'

interface Props {
  onClose: () => void
  defaultCoolingPeriod: string
  timeCostContext: Omit<TimeCostInput, 'amountCents'> | null
}

export function LogSheet({ onClose, defaultCoolingPeriod, timeCostContext }: Props) {
  const [error, action, isPending] = useActionState(logItem, null)
  const [amountCents, setAmountCents] = useState(0)
  const [title, setTitle] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<number>(() => {
    if (defaultCoolingPeriod === '30m') return 0
    if (defaultCoolingPeriod === '1h')  return 1
    if (defaultCoolingPeriod === '5h')  return 2
    if (defaultCoolingPeriod === '1w')  return 4
    return 3
  })
  const [isCustom, setIsCustom] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
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
  const coolingUnit  = isCustom ? undefined : PRESETS[selectedPreset]?.unit
  const canSubmit    = title.trim().length > 0 && amountCents > 0

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      {/* Scrim */}
      <div className="absolute inset-0 bg-[rgba(31,42,46,0.4)]" onClick={onClose} />

      {/* Sheet — flex column so footer stays pinned */}
      <div className="relative bg-background rounded-t-[28px] max-h-[92vh] flex flex-col animate-sheet-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center px-5 py-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <X size={18} strokeWidth={2} className="text-muted-foreground" />
          </button>
          <h2 className="flex-1 text-center text-[16px] font-semibold tracking-[-0.2px]">Log a temptation</h2>
          <div className="w-9" />
        </div>

        {/* Scrollable body */}
        <form ref={formRef} action={action} id="log-form" className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-5">
            {/* Amount hero */}
            <div className="bg-card rounded-[20px] px-5 py-6 text-center shadow-[0_1px_2px_rgba(31,42,46,0.04),0_4px_16px_rgba(31,42,46,0.04)]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.4px] text-[var(--text-muted)] mb-2">How much?</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-[24px] font-semibold text-[var(--text-muted)] tracking-[-0.4px]">RM</span>
                <input
                  name="amount"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  placeholder="0"
                  required
                  onChange={e => setAmountCents(Math.round(parseFloat(e.target.value || '0') * 100))}
                  className="w-44 text-[48px] font-bold text-foreground tabular-nums bg-transparent border-none outline-none text-center placeholder:text-muted-foreground/40 tracking-[-1.5px]"
                />
              </div>
              {timeCost && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--gold-tint)] text-[var(--gold-deep)] text-[13px] font-semibold animate-fade-in">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#A8893E" aria-hidden="true">
                    <path d="M12 3l1.8 5.4L19 10.2 13.8 12 12 17.4 10.2 12 5 10.2l5.2-1.8L12 3z" />
                  </svg>
                  ≈ {timeCost.formatted} of your life
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className={labelClass}>What is it?</label>
              <input
                name="title"
                type="text"
                required
                placeholder="e.g. New sneakers"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Cooling period */}
            <div className="space-y-2">
              <label className={labelClass}>Cooling period</label>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setSelectedPreset(i); setIsCustom(false) }}
                    className={[
                      'h-10 px-4 rounded-[14px] text-[14px] font-semibold transition-all',
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
                    'h-10 px-4 rounded-[14px] text-[14px] font-semibold transition-all',
                    isCustom
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border text-foreground hover:bg-muted',
                  ].join(' ')}
                >
                  Custom
                </button>
              </div>

              {!isCustom && (
                <>
                  <input type="hidden" name="coolingValue" value={coolingValue} />
                  <input type="hidden" name="coolingUnit" value={coolingUnit} />
                </>
              )}

              {isCustom && (
                <div className="flex items-center gap-2 mt-2 bg-card rounded-[14px] px-4 py-3">
                  <input
                    name="coolingValue"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    defaultValue="3"
                    required
                    className="w-16 h-9 px-2 rounded-[10px] bg-background border border-border text-[15px] font-semibold text-foreground text-center focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {(['MINUTES', 'HOURS', 'DAYS', 'WEEKS'] as const).map(unit => (
                    <button
                      key={unit}
                      type="button"
                      className="h-9 px-3 rounded-[10px] text-[14px] font-semibold transition-all bg-transparent text-[var(--text-muted)] hover:bg-muted"
                    >
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="coolingUnit" value={unit} defaultChecked={unit === 'DAYS'} className="accent-primary" />
                        <span className="capitalize">{unit.toLowerCase()}</span>
                      </label>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Note */}
            <div className="space-y-2">
              <label className={labelClass}>Note (optional)</label>
              <textarea
                name="note"
                placeholder="Why are you tempted? What's the context?"
                rows={3}
                className="w-full px-4 py-3 rounded-[14px] bg-background border border-border text-[15px] font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Calm reminder */}
            <div className="bg-[var(--primary-tint)] rounded-[14px] px-4 py-3.5 flex items-start gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1F4744" className="mt-0.5 flex-shrink-0" aria-hidden="true">
                <path d="M20 4c-9 0-15 5-15 12 0 2 .8 3.5 1.5 4.5 1-7 6-11 13-12-.5 7-5 12-12 13 1 .8 2.5 1.5 4.5 1.5 7 0 12-6 12-15V4h-4z" />
              </svg>
              <p className="text-[13px] text-[var(--primary-deep)] leading-relaxed">
                We&apos;ll quietly hold this. When the time is up, you decide — no pressure either way.
              </p>
            </div>

            {error && (
              <p className="text-[13px] text-destructive bg-destructive/10 px-3 py-2 rounded-[10px]">{error}</p>
            )}
          </div>

          {/* Sticky footer */}
          <div className="flex-shrink-0 px-5 py-4 bg-background border-t border-[var(--sep)]">
            <button
              type="submit"
              disabled={isPending || !canSubmit}
              className="w-full h-[56px] rounded-[16px] bg-primary text-primary-foreground text-[16px] font-semibold transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending ? 'Starting cool…' : 'Start cooling'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
