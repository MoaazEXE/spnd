'use client'

import { useState, useTransition } from 'react'
import { Check, ShoppingBag, X, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { editWin } from '@/app/actions/items'
import { fmtRM } from '@/lib/formatters'
import { Card } from '@/components/ui/card'
import { ErrorBanner } from '@/components/ui/error-banner'
import { cn } from '@/lib/utils'

interface HistoryItem {
  id: string
  title: string
  amountCents: number
  status: 'SKIPPED' | 'BOUGHT'
  resolvedAt: Date | null
}

const INPUT =
  'w-full h-13 px-4 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors'
const LABEL = 'text-xs font-semibold uppercase tracking-wide text-muted-foreground'

function relativeDate(date: Date): string {
  const diff = Date.now() - date.getTime()
  const day = 86_400_000
  if (diff < day) return 'Today'
  if (diff < day * 2) return 'Yesterday'
  if (diff < day * 7) return `${Math.floor(diff / day)}d ago`
  return date.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })
}

function EditHistorySheet({ item, onClose }: { item: HistoryItem; onClose: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [outcome, setOutcome] = useState<'SKIPPED' | 'BOUGHT'>(item.status)
  const [title, setTitle] = useState(item.title)
  const [amount, setAmount] = useState(String(item.amountCents / 100))
  const [fieldError, setFieldError] = useState<string | null>(null)

  function handleSave() {
    if (!title.trim()) {
      setFieldError('Enter a name.')
      return
    }
    const amountCents = Math.round(parseFloat(amount || '0') * 100)
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      setFieldError('Enter a valid amount.')
      return
    }
    setFieldError(null)

    const formData = new FormData()
    formData.set('id', item.id)
    formData.set('title', title.trim())
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
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />

      <div className="relative bg-background rounded-t-3xl animate-sheet-up">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="flex items-center px-5 py-3">
          <button
            onClick={onClose}
            className="w-11 h-11 lg:w-9 lg:h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X size={18} strokeWidth={2} className="text-muted-foreground" />
          </button>
          <h2 className="flex-1 text-center text-base font-semibold tracking-tight">Edit entry</h2>
          <div className="w-11 lg:w-9" />
        </div>

        <div className="px-5 pb-8 space-y-4">
          <div>
            <p className={cn(LABEL, 'mb-2')}>Name</p>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className={INPUT}
            />
          </div>

          <Card className="text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Amount
            </p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-2xl font-semibold text-muted-foreground tracking-tight">RM</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-36 text-center text-5xl font-bold text-foreground tabular-nums tracking-tight bg-transparent border-none outline-none placeholder:text-muted-foreground/40"
              />
            </div>
          </Card>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              What actually happened?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOutcome('SKIPPED')}
                className={cn(
                  'flex-1 h-13 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2',
                  outcome === 'SKIPPED'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-foreground hover:bg-muted',
                )}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M5 12l4.5 4.5L19 7"
                    stroke={outcome === 'SKIPPED' ? 'currentColor' : 'var(--gold-deep)'}
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Saved it
              </button>
              <button
                type="button"
                onClick={() => setOutcome('BOUGHT')}
                className={cn(
                  'flex-1 h-13 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2',
                  outcome === 'BOUGHT'
                    ? 'bg-coral-tint text-coral-deep border border-coral-deep/20'
                    : 'bg-card border border-border text-foreground hover:bg-muted',
                )}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M5 8h14l-1 12H6L5 8z"
                    stroke={outcome === 'BOUGHT' ? 'currentColor' : 'var(--text-muted)'}
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 8V6a3 3 0 016 0v2"
                    stroke={outcome === 'BOUGHT' ? 'currentColor' : 'var(--text-muted)'}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                Bought it
              </button>
            </div>
          </div>

          <ErrorBanner message={fieldError} />

          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="w-full h-14 rounded-xl bg-primary text-primary-foreground text-base font-semibold transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function HistoryCard({ item }: { item: HistoryItem }) {
  const [editing, setEditing] = useState(false)
  const isSkipped = item.status === 'SKIPPED'
  const Icon = isSkipped ? Check : ShoppingBag

  return (
    <>
      {editing && <EditHistorySheet item={item} onClose={() => setEditing(false)} />}

      <button
        type="button"
        onClick={() => setEditing(true)}
        className="w-full flex items-center gap-3 rounded-xl bg-card p-4 shadow-card text-left transition-colors hover:bg-muted/50 active:bg-muted"
      >
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-sm flex items-center justify-center',
            isSkipped ? 'bg-gold-tint text-gold-deep' : 'bg-coral-tint text-coral-deep',
          )}
        >
          <Icon size={16} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isSkipped ? 'Skipped' : 'Bought'}
            {item.resolvedAt && ` · ${relativeDate(item.resolvedAt)}`}
          </p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
          <span
            className={cn(
              'text-sm font-semibold tabular-nums',
              isSkipped ? 'text-primary' : 'text-foreground',
            )}
          >
            {isSkipped ? '+' : ''}
            {fmtRM(item.amountCents, 0)}
          </span>
          <Pencil size={13} className="text-subtle-foreground" />
        </div>
      </button>
    </>
  )
}
