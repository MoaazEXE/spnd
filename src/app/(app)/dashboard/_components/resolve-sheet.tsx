'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { resolveItem, snoozeItem } from '@/app/actions/items'
import { fmtRM } from '@/lib/formatters'
import { SheetFrame } from '@/components/ui/sheet-frame'
import { cn } from '@/lib/utils'

interface ResolveItem {
  id: string
  title: string
  amountCents: number
  timeCostFormatted?: string
}

interface Props {
  item: ResolveItem
  onClose: () => void
  onSkipped: (amountCents: number, timeCostFormatted?: string) => void
}

export function ResolveSheet({ item, onClose, onSkipped }: Props) {
  const [pending, startTransition] = useTransition()

  function handleBuy() {
    startTransition(async () => {
      await resolveItem(item.id, 'BOUGHT')
      onClose()
      toast(`${item.title} · bought`, { description: 'Removed from cooling.' })
    })
  }

  function handleSkip() {
    startTransition(async () => {
      await resolveItem(item.id, 'SKIPPED')
      onClose()
      onSkipped(item.amountCents, item.timeCostFormatted)
    })
  }

  function handleSnooze() {
    startTransition(async () => {
      await snoozeItem(item.id)
      onClose()
      toast(`${item.title} · snoozed`, { description: 'Cooling extended by 1 day.' })
    })
  }

  return (
    <SheetFrame title="Cooling" onClose={onClose}>
      <div className="px-5 pb-8">
        <div className="mb-6 text-center">
          <p className="text-xl font-bold text-foreground tracking-tight">{item.title}</p>
          <p className="mt-1 text-3xl font-bold text-primary tabular-nums leading-tight tracking-tight">
            {fmtRM(item.amountCents)}
          </p>
          {item.timeCostFormatted && (
            <p className="mt-1.5 text-sm text-muted-foreground">
              ≈ {item.timeCostFormatted} of your life
            </p>
          )}
        </div>

        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Still want it?
        </p>

        <div className="flex gap-2.5">
          <ActionButton onClick={handleBuy} disabled={pending} tone="coral">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 8h14l-1 12H6L5 8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M9 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Buy it
          </ActionButton>

          <ActionButton onClick={handleSnooze} disabled={pending} tone="primary-tint">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 7h6L5 17h6M14 11h5l-5 6h5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Snooze
          </ActionButton>

          <ActionButton onClick={handleSkip} disabled={pending} tone="primary" wide>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 12l4.5 4.5L19 7"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Skip
          </ActionButton>
        </div>
      </div>
    </SheetFrame>
  )
}

const toneClasses = {
  coral: 'bg-coral-tint text-coral-deep',
  'primary-tint': 'bg-primary-tint text-primary-deep',
  primary: 'bg-primary text-primary-foreground',
} as const

function ActionButton({
  onClick,
  disabled,
  tone,
  wide,
  children,
}: {
  onClick: () => void
  disabled: boolean
  tone: keyof typeof toneClasses
  wide?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'h-14 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50',
        wide ? 'flex-[1.2]' : 'flex-1',
        toneClasses[tone],
      )}
    >
      {children}
    </button>
  )
}
