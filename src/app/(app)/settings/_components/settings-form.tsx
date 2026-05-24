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
  const [income, setIncome] = useState<string>(
    initial.monthlyIncomeCents ? String(initial.monthlyIncomeCents / 100) : '',
  )
  const [hours, setHours] = useState<string>(
    initial.workingHoursPerWeek != null ? String(initial.workingHoursPerWeek) : '',
  )
  const [trueMode, setTrueMode] = useState(initial.timeCostMode === 'TRUE_HOURLY')
  const [commute, setCommute] = useState<string>(
    initial.commuteHours != null ? String(initial.commuteHours) : '',
  )
  const [workCosts, setWorkCosts] = useState<string>(
    initial.workCostsCents ? String(initial.workCostsCents / 100) : '',
  )

  const incomeN = Number(income)
  const hoursN = Number(hours)
  const ready = income && hours && incomeN > 0 && hoursN > 0

  const preview = ready
    ? calculateTimeCost({
        amountCents: 100, // RM 1 reference; hourly wage = 1 / preview.hours
        monthlyIncomeCents: Math.round(incomeN * 100),
        workingHoursPerWeek: hoursN,
        mode: trueMode ? 'TRUE_HOURLY' : 'SIMPLE',
        commuteHours: commute ? Number(commute) : undefined,
        workCostsCents: workCosts ? Math.round(Number(workCosts) * 100) : undefined,
      })
    : null

  const saved = message === null && !isPending

  return (
    <form action={action} className="space-y-5">
      {/* Info banner */}
      <div className="bg-[var(--primary-tint)] rounded-[14px] px-4 py-3.5">
        <p className="text-[13px] text-[var(--primary-deep)] leading-relaxed">
          Optional. If you add your income, every price will also show as{' '}
          <strong>hours of your life</strong> — a different lens, not a judgement.
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
            step="100"
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
            step="1"
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
            <p className="text-[13px] text-[var(--text-muted)] mt-0.5 leading-relaxed">
              Subtract commute and work-related costs for a closer estimate of what each hour is actually worth.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={trueMode}
            onClick={() => setTrueMode(v => !v)}
            className="relative flex-shrink-0 p-0 border-0 cursor-pointer rounded-full transition-colors duration-200"
            style={{
              width: 48,
              height: 28,
              background: trueMode ? 'var(--primary)' : '#D7D3CB',
            }}
          >
            <span
              className="block rounded-full bg-white shadow"
              style={{
                position: 'absolute',
                top: 2,
                left: 2,
                width: 24,
                height: 24,
                transform: trueMode ? 'translateX(20px)' : 'translateX(0)',
                transition: 'transform 200ms cubic-bezier(.2,.8,.3,1)',
              }}
            />
          </button>
        </div>
        <input type="hidden" name="timeCostMode" value={trueMode ? 'TRUE_HOURLY' : 'SIMPLE'} />
      </div>

      {/* True mode extra fields */}
      {trueMode && (
        <div className="space-y-4 pl-1 animate-fade-in">
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
              value={commute}
              onChange={e => setCommute(e.target.value)}
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
                step="10"
                placeholder="200"
                value={workCosts}
                onChange={e => setWorkCosts(e.target.value)}
                className={inputClass + ' pl-10'}
              />
            </div>
          </div>
        </div>
      )}

      {/* Live preview */}
      {preview && (
        <div className="bg-[var(--gold-tint)] rounded-[16px] px-4 py-5 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--gold-deep)] mb-1.5">
            Your hour is worth
          </p>
          <p className="text-[36px] font-bold text-[var(--gold-deep)] tabular-nums leading-tight tracking-[-1px]">
            RM {(1 / preview.hours).toFixed(2)}
          </p>
          <p className="text-[13px] text-[var(--gold-deep)]/70 mt-1.5">
            {trueMode ? 'after work-related costs' : 'before adjustments'} · every RM 1 costs you {preview.formatted}
          </p>
        </div>
      )}

      {message && message !== null && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-[10px]">{message}</p>
      )}

      {saved && message === null && !isPending && (
        <p className="text-sm text-primary text-center">Settings saved ✓</p>
      )}

      <div className="flex gap-3">
        <a
          href="/dashboard"
          className="flex-1 h-12 rounded-[14px] border border-border bg-transparent text-[15px] font-semibold text-[var(--text-muted)] flex items-center justify-center hover:bg-muted transition-colors"
        >
          Skip for now
        </a>
        <Button type="submit" disabled={isPending} className="flex-[1.4] h-12 rounded-[14px] text-[15px] font-semibold">
          {isPending ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  )
}
