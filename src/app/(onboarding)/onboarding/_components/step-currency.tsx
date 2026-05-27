'use client'

import { CURRENCIES } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import { BrandMark } from '@/components/ui/brand-mark'
import { OnboardingStepper } from './onboarding-stepper'

interface Props {
  value: string
  onChange: (code: string) => void
  onNext: () => void
  onBack: () => void
}

export function StepCurrency({ value, onChange, onNext, onBack }: Props) {
  return (
    <div>
      <div className="mb-8">
        <BrandMark size="md" />
      </div>

      <OnboardingStepper currentStep={1} totalSteps={3} />

      <div className="mb-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
          Step 2 of 3
        </p>
        <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-tight text-foreground">
          Your currency
        </h1>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          Used for all amounts in Settle. You can change this later in settings.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {CURRENCIES.map(c => (
            <button
              key={c.code}
              type="button"
              onClick={() => onChange(c.code)}
              className={cn(
                'flex items-center gap-3 h-14 px-4 rounded-xl border text-left transition-all',
                value === c.code
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border bg-muted/30 hover:border-primary/40',
              )}
            >
              <span className="text-lg font-semibold text-foreground w-7 shrink-0">{c.symbol}</span>
              <span className="text-sm font-medium text-foreground leading-tight">{c.label}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onBack}
            className="h-14 px-6 rounded-xl border border-border text-base font-semibold text-foreground transition-all active:scale-[0.97]"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onNext}
            className="flex-1 h-14 rounded-xl bg-primary text-primary-foreground text-base font-semibold transition-all active:scale-[0.97]"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
