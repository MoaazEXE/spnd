'use client'

import { useTransition } from 'react'
import { X, ShoppingBag } from 'lucide-react'
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
    })
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      <div className="absolute inset-0 bg-[rgba(31,42,46,0.4)]" onClick={onClose} />

      <div className="relative bg-background rounded-t-[28px] animate-sheet-up">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="flex items-center px-5 py-3">
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
            <X size={18} strokeWidth={2} className="text-muted-foreground" />
          </button>
          <h2 className="flex-1 text-center text-[16px] font-semibold tracking-[-0.2px]">Still want it?</h2>
          <div className="w-9" />
        </div>

        <div className="px-5 pb-8">
          {/* Item summary */}
          <div className="text-center mb-6">
            <p className="text-[22px] font-bold text-foreground">{item.title}</p>
            <p className="text-[32px] font-bold text-primary tabular-nums leading-tight">
              {fmtRM(item.amountCents)}
            </p>
            {item.timeCostFormatted && (
              <p className="text-[14px] text-muted-foreground mt-1">≈ {item.timeCostFormatted} of your life</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {/* Buy */}
            <button
              onClick={handleBuy}
              disabled={pending}
              className="flex-1 h-14 rounded-[16px] bg-[#F7E3DF] text-[#8C3A2E] font-semibold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50"
            >
              <ShoppingBag size={16} strokeWidth={2} />
              Buy it
            </button>

            {/* Snooze */}
            <button
              onClick={handleSnooze}
              disabled={pending}
              className="flex-1 h-14 rounded-[16px] bg-secondary text-primary font-semibold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50"
            >
              <span className="text-[16px]">💤</span>
              +1 day
            </button>

            {/* Skip — primary action, slightly wider */}
            <button
              onClick={handleSkip}
              disabled={pending}
              className="flex-[1.2] h-14 rounded-[16px] bg-primary text-primary-foreground font-semibold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50"
            >
              <span className="text-[16px]">✓</span>
              Skip — save {fmtRM(item.amountCents, 0)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
