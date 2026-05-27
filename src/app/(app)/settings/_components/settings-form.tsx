'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { saveIncomeSettings } from '@/app/actions/users'
import { calculateTimeCost } from '@/core/timecost/timeCost'
import { CURRENCIES } from '@/lib/formatters'
import { Card } from '@/components/ui/card'
import { ErrorBanner } from '@/components/ui/error-banner'
import { cn } from '@/lib/utils'

const INPUT =
  'w-full h-13 px-4 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors'
const LABEL = 'text-xs font-semibold uppercase tracking-wide text-muted-foreground'

interface Props {
  initial: {
    monthlyIncomeCents: number | null
    workingHoursPerWeek: number | null
    timeCostMode: 'SIMPLE' | 'TRUE_HOURLY'
    commuteHours: number | null
    workCostsCents: number | null
    currency: string
  }
}

export function SettingsForm({ initial }: Props) {
  const [message, action, isPending] = useActionState(saveIncomeSettings, null)
  const wasPending = useRef(false)
  useEffect(() => {
    if (wasPending.current && !isPending && message === null) {
      toast.success('Settings saved', {
        description: 'Your hourly lens has been updated.',
      })
    }
    wasPending.current = isPending
  }, [isPending, message])
  const [currency, setCurrency] = useState(initial.currency)
  const [income, setIncome] = useState(
    initial.monthlyIncomeCents ? String(initial.monthlyIncomeCents / 100) : '',
  )
  const [hours, setHours] = useState(
    initial.workingHoursPerWeek != null ? String(initial.workingHoursPerWeek) : '',
  )
  const [trueMode, setTrueMode] = useState(initial.timeCostMode === 'TRUE_HOURLY')
  const [commute, setCommute] = useState(
    initial.commuteHours != null ? String(initial.commuteHours) : '',
  )
  const [workCosts, setWorkCosts] = useState(
    initial.workCostsCents ? String(initial.workCostsCents / 100) : '',
  )

  const incomeN = Number(income)
  const hoursN = Number(hours)
  const ready = income && hours && incomeN > 0 && hoursN > 0

  const preview = ready
    ? calculateTimeCost({
        amountCents: 100,
        monthlyIncomeCents: Math.round(incomeN * 100),
        workingHoursPerWeek: hoursN,
        mode: trueMode ? 'TRUE_HOURLY' : 'SIMPLE',
        commuteHours: commute ? Number(commute) : undefined,
        workCostsCents: workCosts ? Math.round(Number(workCosts) * 100) : undefined,
      })
    : null

  return (
    <form action={action} className="space-y-5">
      <Field label="Currency">
        <select
          name="currency"
          value={currency}
          onChange={e => setCurrency(e.target.value)}
          className={cn(INPUT, 'appearance-none')}
        >
          {CURRENCIES.map(c => (
            <option key={c.code} value={c.code}>
              {c.symbol} — {c.label}
            </option>
          ))}
        </select>
      </Field>

      <div className="rounded-lg bg-primary-tint px-4 py-3.5">
        <p className="text-xs text-primary-deep leading-relaxed">
          Optional. If you add your income, every price will also show as{' '}
          <strong>hours of your life</strong> — a different lens, not a judgement.
        </p>
      </div>

      <Field label="Monthly take-home">
        <Affix prefix={CURRENCIES.find(c => c.code === currency)?.symbol ?? currency}>
          <input
            name="monthlyIncome"
            type="number"
            inputMode="decimal"
            min="0"
            step="100"
            placeholder="3,500"
            value={income}
            onChange={e => setIncome(e.target.value)}
            className={cn(INPUT, 'pl-10')}
          />
        </Affix>
      </Field>

      <Field label="Working hours per week">
        <Affix suffix="hrs/week">
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
            className={cn(INPUT, 'pr-24')}
          />
        </Affix>
      </Field>

      <Card padding="md">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">True hourly wage</p>
            <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
              Subtract commute and work-related costs for a closer estimate of what each hour is
              actually worth.
            </p>
          </div>
          <Toggle checked={trueMode} onChange={() => setTrueMode(v => !v)} />
        </div>
        <input type="hidden" name="timeCostMode" value={trueMode ? 'TRUE_HOURLY' : 'SIMPLE'} />
      </Card>

      {trueMode && (
        <div className="space-y-4 pl-1 animate-fade-in">
          <Field label="Commute time (hours/day)">
            <input
              name="commuteHours"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              placeholder="1.5"
              value={commute}
              onChange={e => setCommute(e.target.value)}
              className={INPUT}
            />
          </Field>
          <Field label="Monthly work costs">
            <Affix prefix={CURRENCIES.find(c => c.code === currency)?.symbol ?? currency}>
              <input
                name="workCosts"
                type="number"
                inputMode="decimal"
                min="0"
                step="10"
                placeholder="200"
                value={workCosts}
                onChange={e => setWorkCosts(e.target.value)}
                className={cn(INPUT, 'pl-10')}
              />
            </Affix>
          </Field>
        </div>
      )}

      {preview && (
        <div className="rounded-xl bg-gold-tint px-4 py-5 text-center">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-gold-deep">
            Your hour is worth
          </p>
          <p className="text-4xl font-bold leading-tight tracking-tight text-gold-deep tabular-nums">
            {CURRENCIES.find(c => c.code === currency)?.symbol ?? currency}{' '}
            {(1 / preview.hours).toFixed(2)}
          </p>
          <p className="mt-1.5 text-xs text-gold-deep/70">
            {trueMode ? 'after work-related costs' : 'before adjustments'} · every 1 unit costs you{' '}
            {preview.formatted}
          </p>
        </div>
      )}

      <ErrorBanner message={message} />

      <div className="flex gap-3">
        <a
          href="/dashboard"
          className="flex-1 h-12 rounded-lg border border-border flex items-center justify-center text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
        >
          Skip for now
        </a>
        <button
          type="submit"
          disabled={isPending}
          className="flex-[1.4] h-12 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-deep transition-colors disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className={LABEL}>{label}</label>
      {children}
    </div>
  )
}

function Affix({
  prefix,
  suffix,
  children,
}: {
  prefix?: string
  suffix?: string
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {prefix}
        </span>
      )}
      {children}
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        'relative flex-shrink-0 w-12 h-7 rounded-full transition-colors duration-200',
        checked ? 'bg-primary' : 'bg-border',
      )}
    >
      <span
        className={cn(
          'block absolute top-0.5 w-6 h-6 rounded-full bg-card shadow transition-transform duration-200',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}
