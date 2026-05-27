'use client'

import { cn } from '@/lib/utils'

interface Props {
  currentStep: number
  totalSteps: number
}

export function OnboardingStepper({ currentStep, totalSteps }: Props) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-full transition-all duration-300',
            i < currentStep
              ? 'h-2 w-2 bg-primary'
              : i === currentStep
                ? 'h-2 w-5 bg-primary'
                : 'h-2 w-2 bg-muted-foreground/30',
          )}
        />
      ))}
    </div>
  )
}
