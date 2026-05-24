'use client'

import { useTransition } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { resolveItem, snoozeItem } from '@/app/actions/items'
import { fmtRM } from '@/lib/formatters'

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
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      <div className="absolute inset-0 bg-[rgba(31,42,46,0.4)]" onClick={onClose} />

      <div className="relative bg-background rounded-t-[28px] animate-sheet-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center px-5 py-3">
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
            <X size={18} strokeWidth={2} className="text-muted-foreground" />
          </button>
          <h2 className="flex-1 text-center text-[16px] font-semibold tracking-[-0.2px]">Cooling</h2>
          <div className="w-9" />
        </div>

        <div className="px-5 pb-8">
          {/* Item summary */}
          <div className="text-center mb-6">
            <p className="text-[22px] font-bold text-foreground tracking-[-0.5px]">{item.title}</p>
            <p className="text-[32px] font-bold text-primary tabular-nums leading-tight tracking-[-1px] mt-1">
              {fmtRM(item.amountCents)}
            </p>
            {item.timeCostFormatted && (
              <p className="text-[14px] text-[var(--text-muted)] mt-1.5">≈ {item.timeCostFormatted} of your life</p>
            )}
          </div>

          {/* "Still want it?" prompt */}
          <p className="text-[13px] font-semibold text-[var(--text-muted)] text-center mb-3 uppercase tracking-[0.2px]">
            Still want it?
          </p>

          {/* Action buttons */}
          <div className="flex gap-2.5">
            {/* Buy */}
            <button
              onClick={handleBuy}
              disabled={pending}
              className="flex-1 h-[56px] rounded-[16px] bg-[var(--coral-tint)] text-[#8C3A2E] font-semibold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 8h14l-1 12H6L5 8z" stroke="#8C3A2E" strokeWidth="1.8" strokeLinejoin="round"/>
                <path d="M9 8V6a3 3 0 016 0v2" stroke="#8C3A2E" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              Buy it
            </button>

            {/* Snooze */}
            <button
              onClick={handleSnooze}
              disabled={pending}
              className="flex-1 h-[56px] rounded-[16px] bg-[var(--primary-tint)] text-[var(--primary-deep)] font-semibold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 7h6L5 17h6M14 11h5l-5 6h5" stroke="#1F4744" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Snooze
            </button>

            {/* Skip — primary action, slightly wider */}
            <button
              onClick={handleSkip}
              disabled={pending}
              className="flex-[1.2] h-[56px] rounded-[16px] bg-primary text-primary-foreground font-semibold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12l4.5 4.5L19 7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
