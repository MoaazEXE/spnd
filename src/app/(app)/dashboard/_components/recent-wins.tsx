'use client'

import { useTransition, useState } from 'react'
import { X, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { editWin } from '@/app/actions/items'
import { fmtRM } from '@/lib/formatters'

interface WinItem {
  id: string
  title: string
  amountCents: number
  resolvedAt: Date | null
  status: 'SKIPPED' | 'BOUGHT'
}

interface Props {
  skippedItems: WinItem[]
  boughtItems: WinItem[]
  maxItems?: number
}

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  if (diff < 3_600_000) return 'Just now'
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12l4.5 4.5L19 7" stroke="#A8893E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 8h14l-1 12H6L5 8z" stroke="#8C3A2E" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 016 0v2" stroke="#8C3A2E" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function EditSheet({ item, onClose }: { item: WinItem; onClose: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [outcome, setOutcome] = useState<'SKIPPED' | 'BOUGHT'>(item.status)
  const [amount, setAmount] = useState(String(item.amountCents / 100))
  const [fieldError, setFieldError] = useState<string | null>(null)

  function handleSave() {
    const amountCents = Math.round(parseFloat(amount || '0') * 100)
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      setFieldError('Enter a valid amount.')
      return
    }
    setFieldError(null)

    const formData = new FormData()
    formData.set('id', item.id)
    formData.set('amount', String(amountCents / 100))
    formData.set('outcome', outcome)

    startTransition(async () => {
      const err = await editWin(null, formData)
      if (err) {
        setFieldError(err)
      } else {
        toast.success('Entry updated')
        onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-[rgba(31,42,46,0.4)]" onClick={onClose} />

      <div className="relative bg-background rounded-t-[28px] animate-sheet-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center px-5 py-3">
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <X size={18} strokeWidth={2} className="text-muted-foreground" />
          </button>
          <h2 className="flex-1 text-center text-[16px] font-semibold tracking-[-0.2px]">Edit entry</h2>
          <div className="w-9" />
        </div>

        <div className="px-5 pb-8 space-y-4">
          {/* Title */}
          <p className="text-center text-[20px] font-bold text-foreground tracking-[-0.4px] pt-1">{item.title}</p>

          {/* Amount */}
          <div className="bg-card rounded-[20px] px-5 py-5 text-center shadow-[0_1px_2px_rgba(31,42,46,0.04),0_4px_16px_rgba(31,42,46,0.04)]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.4px] text-[var(--text-muted)] mb-2">Amount</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-[24px] font-semibold text-[var(--text-muted)] tracking-[-0.4px]">RM</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-36 text-[44px] font-bold text-foreground tabular-nums bg-transparent border-none outline-none text-center placeholder:text-muted-foreground/40 tracking-[-1.5px]"
              />
            </div>
          </div>

          {/* Outcome toggle */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.4px] text-muted-foreground mb-2">What actually happened?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOutcome('SKIPPED')}
                className={[
                  'flex-1 h-[52px] rounded-[14px] text-[14px] font-semibold transition-all flex items-center justify-center gap-2',
                  outcome === 'SKIPPED'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-foreground hover:bg-muted',
                ].join(' ')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12l4.5 4.5L19 7" stroke={outcome === 'SKIPPED' ? '#fff' : '#A8893E'} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Saved it
              </button>
              <button
                type="button"
                onClick={() => setOutcome('BOUGHT')}
                className={[
                  'flex-1 h-[52px] rounded-[14px] text-[14px] font-semibold transition-all flex items-center justify-center gap-2',
                  outcome === 'BOUGHT'
                    ? 'bg-[var(--coral-tint)] text-[var(--coral-deep)] border border-[var(--coral-deep)]/20'
                    : 'bg-card border border-border text-foreground hover:bg-muted',
                ].join(' ')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 8h14l-1 12H6L5 8z" stroke={outcome === 'BOUGHT' ? '#8C3A2E' : '#6B7A7E'} strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M9 8V6a3 3 0 016 0v2" stroke={outcome === 'BOUGHT' ? '#8C3A2E' : '#6B7A7E'} strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Bought it
              </button>
            </div>
          </div>

          {fieldError && (
            <p className="text-[13px] text-destructive bg-destructive/10 px-3 py-2 rounded-[10px]">{fieldError}</p>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="w-full h-[56px] rounded-[16px] bg-primary text-primary-foreground text-[16px] font-semibold transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function RecentWins({ skippedItems, boughtItems, maxItems = 3 }: Props) {
  const [editItem, setEditItem] = useState<WinItem | null>(null)

  const recentSkipped = skippedItems.slice(0, maxItems)
  const recentBought = boughtItems.slice(0, 2)
  const allItems = [...recentSkipped, ...recentBought]

  if (allItems.length === 0) return null

  return (
    <section>
      {editItem && <EditSheet item={editItem} onClose={() => setEditItem(null)} />}

      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-semibold uppercase tracking-[0.2px] text-[var(--text-muted)]">
          Recent activity
        </p>
      </div>

      <div className="bg-card rounded-[20px] shadow-[0_1px_2px_rgba(31,42,46,0.04),0_4px_16px_rgba(31,42,46,0.04)] overflow-hidden">
        {allItems.map((item, i) => {
          const isSaved = item.status === 'SKIPPED'
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setEditItem(item)}
              className="w-full flex items-center gap-3.5 px-[18px] py-3.5 transition-colors hover:bg-[var(--primary-tint)]/30 active:bg-[var(--primary-tint)]/50 text-left"
              style={{ borderBottom: i < allItems.length - 1 ? '1px solid rgba(31,42,46,0.07)' : 'none' }}
            >
              <div className={[
                'w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0',
                isSaved ? 'bg-[var(--gold-tint)]' : 'bg-[var(--coral-tint)]',
              ].join(' ')}>
                {isSaved ? <CheckIcon /> : <BagIcon />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-foreground truncate">{item.title}</p>
                <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
                  {isSaved ? 'Saved' : 'Bought'} · {item.resolvedAt ? relativeTime(item.resolvedAt) : ''}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={[
                  'text-[15px] font-semibold tabular-nums',
                  isSaved ? 'text-primary' : 'text-[var(--coral-deep)]',
                ].join(' ')}>
                  {isSaved ? '+' : ''}{fmtRM(item.amountCents, 0)}
                </span>
                <Pencil size={13} className="text-[var(--text-subtle)]" />
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
