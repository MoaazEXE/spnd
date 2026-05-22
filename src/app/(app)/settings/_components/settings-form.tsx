'use client'

import { useActionState, useState } from 'react'
import { saveIncomeSettings } from '@/app/actions/users'
import { Button } from '@/components/ui/button'
import { calculateTimeCost } from '@/core/timecost/timeCost'

const inputClass =
  'w-full h-[52px] px-4 rounded-[14px] bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all'

interface Props {
  initial: {
    monthlyIncomeCents: number | null
    workingHoursPerWeek: number | null
    timeCostMode: 'SIMPLE' | 'TRUE_HOURLY'
    commuteHours: number | null
    workCostsCents: number | null
  }
}

export function SettingsForm({ initial }: Props) {
  const [message, action, isPending] = useActionState(saveIncomeSettings, null)
  const [income, setIncome] = useState(initial.monthlyIncomeCents ? initial.monthlyIncomeCents / 100 : '')
  const [hours, setHours] = useState(initial.workingHoursPerWeek ?? '')
  const [trueMode, setTrueMode] = useState(initial.timeCostMode === 'TRUE_HOURLY')

  const preview =
    income && hours && Number(income) > 0 && Number(hours) > 0
      ? calculateTimeCost({
          amountCents: 100, // RM 1.00 as reference
          monthlyIncomeCents: Math.round(Number(income) * 100),
          workingHoursPerWeek: Number(hours),
          mode: trueMode ? 'TRUE_HOURLY' : 'SIMPLE',
        })
      : null

  const saved = message === null && !isPending

  return (
    <form action={action} className="space-y-5">
      {/* Info banner */}
      <div className="bg-secondary rounded-[16px] px-4 py-3">
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          Optional. If you add your income, every price will also show as{' '}
          <strong className="text-foreground">hours of your life</strong> — a different lens, not a judgement.
        </p>
      </div>

      {/* Monthly income */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-[0.4px] text-muted-foreground">
          Monthly take-home (RM)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">RM</span>
          <input
            name="monthlyIncome"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="3,500"
            value={income}
            onChange={e => setIncome(e.target.value)}
            className={inputClass + ' pl-10'}
          />
        </div>
      </div>

      {/* Working hours */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-[0.4px] text-muted-foreground">
          Working hours per week
        </label>
        <div className="relative">
          <input
            name="weeklyHours"
            type="number"
            inputMode="decimal"
            min="1"
            max="168"
            step="0.5"
            placeholder="40"
            value={hours}
            onChange={e => setHours(e.target.value)}
            className={inputClass + ' pr-20'}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">hrs/week</span>
        </div>
      </div>

      {/* True hourly wage toggle */}
      <div className="bg-card rounded-[16px] px-4 py-4 shadow-[0_1px_2px_rgba(31,42,46,0.04),0_4px_16px_rgba(31,42,46,0.04)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-foreground">True hourly wage</p>
            <p className="text-[13px] text-muted-foreground mt-0.5 leading-relaxed">
              Subtract commute and work-related costs for a closer estimate of what each hour is actually worth.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={trueMode}
            onClick={() => setTrueMode(v => !v)}
            className={[
              'relative flex-shrink-0 w-12 h-7 rounded-full transition-colors duration-200',
              trueMode ? 'bg-primary' : 'bg-border',
            ].join(' ')}
          >
            <span className={[
              'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-200',
              trueMode ? 'translate-x-5' : 'translate-x-0.5',
            ].join(' ')} />
          </button>
        </div>
        <input type="hidden" name="timeCostMode" value={trueMode ? 'TRUE_HOURLY' : 'SIMPLE'} />
      </div>

      {/* True mode extra fields */}
      {trueMode && (
        <div className="space-y-4 pl-1">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.4px] text-muted-foreground">
              Commute time (hours/day)
            </label>
            <input
              name="commuteHours"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              placeholder="1.5"
              defaultValue={initial.commuteHours ?? ''}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.4px] text-muted-foreground">
              Monthly work costs (RM)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">RM</span>
              <input
                name="workCosts"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="200"
                defaultValue={initial.workCostsCents ? initial.workCostsCents / 100 : ''}
                className={inputClass + ' pl-10'}
              />
            </div>
          </div>
        </div>
      )}

      {/* Live preview */}
      {preview && (
        <div className="bg-[#F4ECD8] rounded-[16px] px-4 py-4 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4px] text-[#A8893E] mb-1">
            Your hour is worth
          </p>
          <p className="text-[36px] font-bold text-[#A8893E] tabular-nums leading-tight">
            RM {(100 / preview.hours).toFixed(2)}
          </p>
          <p className="text-[13px] text-[#A8893E]/70 mt-1">Every RM 1 costs you {preview.formatted}</p>
        </div>
      )}

      {message && message !== null && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-[10px]">{message}</p>
      )}

      {saved && message === null && !isPending && (
        <p className="text-sm text-primary text-center">Settings saved ✓</p>
      )}

      <Button type="submit" disabled={isPending} className="w-full h-12 rounded-[14px] text-sm font-semibold">
        {isPending ? 'Saving…' : 'Save settings'}
      </Button>
    </form>
  )
}
