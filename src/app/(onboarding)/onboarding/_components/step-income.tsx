'use client'

import { BrandMark } from '@/components/ui/brand-mark'
import { OnboardingStepper } from './onboarding-stepper'

interface Props {
  monthlyIncome: string
  weeklyHours: string
  onMonthlyIncomeChange: (v: string) => void
  onWeeklyHoursChange: (v: string) => void
  onBack: () => void
  onSubmit: () => void
  isPending: boolean
  error: string | null
}

export function StepIncome({
  monthlyIncome,
  weeklyHours,
  onMonthlyIncomeChange,
  onWeeklyHoursChange,
  onBack,
  onSubmit,
  isPending,
  error,
}: Props) {
  return (
    <div>
      <div className="mb-8">
        <BrandMark size="md" />
      </div>

      <OnboardingStepper currentStep={2} totalSteps={3} />

      <div className="mb-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
          Step 3 of 3
        </p>
        <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-tight text-foreground">
          Your income
        </h1>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          Optional — Settle uses this to show you how many hours of work each purchase costs.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-2">
            <label
              htmlFor="onboarding-income"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Monthly take-home income
            </label>
            <input
              id="onboarding-income"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={monthlyIncome}
              onChange={e => onMonthlyIncomeChange(e.target.value)}
              placeholder="e.g. 5000"
              className="w-full h-13 px-4 rounded-xl bg-muted/50 border border-border text-base font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="onboarding-hours"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Working hours per week
            </label>
            <input
              id="onboarding-hours"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={weeklyHours}
              onChange={e => onWeeklyHoursChange(e.target.value)}
              placeholder="e.g. 40"
              className="w-full h-13 px-4 rounded-xl bg-muted/50 border border-border text-base font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onBack}
            disabled={isPending}
            className="h-14 px-6 rounded-xl border border-border text-base font-semibold text-foreground transition-all active:scale-[0.97] disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isPending}
            className="flex-1 h-14 rounded-xl bg-primary text-primary-foreground text-base font-semibold transition-all active:scale-[0.97] disabled:opacity-40"
          >
            {isPending ? 'Setting up…' : 'Get started'}
          </button>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isPending}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-1 disabled:opacity-40"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
