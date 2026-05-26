'use client'

import { useState, useTransition } from 'react'
import { X, Pencil, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { editWin } from '@/app/actions/items'
import { fmtRM } from '@/lib/formatters'
import { Card } from '@/components/ui/card'
import { ErrorBanner } from '@/components/ui/error-banner'
import { cn, toDate } from '@/lib/utils'

interface WinItem {
  id: string
  title: string
  amountCents: number
  resolvedAt: Date | string | null
  status: 'SKIPPED' | 'BOUGHT'
}

interface Props {
  skippedItems: WinItem[]
  boughtItems: WinItem[]
  maxItems?: number
}

function relativeTime(date: Date | string): string {
  const d = toDate(date)
  const diff = Date.now() - d.getTime()
  if (diff < 3_600_000) return 'Just now'
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12l4.5 4.5L19 7"
        stroke="var(--gold-deep)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 8h14l-1 12H6L5 8z" stroke="var(--coral-deep)" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 016 0v2" stroke="var(--coral-deep)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

const INPUT =
  'w-full h-13 px-4 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors'
const LABEL = 'text-xs font-semibold uppercase tracking-wide text-muted-foreground'

function EditSheet({ item, onClose }: { item: WinItem; onClose: () => void }) {
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
              <span className="text-2xl font-semibold text-muted-foreground tracking-tight">
                RM
              </span>
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
              <OutcomeButton
                active={outcome === 'SKIPPED'}
                onClick={() => setOutcome('SKIPPED')}
                tone="saved"
              >
                Saved it
              </OutcomeButton>
              <OutcomeButton
                active={outcome === 'BOUGHT'}
                onClick={() => setOutcome('BOUGHT')}
                tone="bought"
              >
                Bought it
              </OutcomeButton>
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

function OutcomeButton({
  active,
  onClick,
  tone,
  children,
}: {
  active: boolean
  onClick: () => void
  tone: 'saved' | 'bought'
  children: React.ReactNode
}) {
  const activeClass =
    tone === 'saved'
      ? 'bg-primary text-primary-foreground'
      : 'bg-coral-tint text-coral-deep border border-coral-deep/20'
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 h-13 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2',
        active ? activeClass : 'bg-card border border-border text-foreground hover:bg-muted',
      )}
    >
      {tone === 'saved' ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 12l4.5 4.5L19 7"
            stroke={active ? 'currentColor' : 'var(--gold-deep)'}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 8h14l-1 12H6L5 8z"
            stroke={active ? 'currentColor' : 'var(--text-muted)'}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M9 8V6a3 3 0 016 0v2"
            stroke={active ? 'currentColor' : 'var(--text-muted)'}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      )}
      {children}
    </button>
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

      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Recent activity
        </p>
        <Link
          href="/profile"
          prefetch
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          See all <ArrowRight size={12} strokeWidth={2.2} />
        </Link>
      </div>

      <Card padding="none" className="overflow-hidden">
        {allItems.map((item, i) => {
          const isSaved = item.status === 'SKIPPED'
          const isLast = i === allItems.length - 1
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setEditItem(item)}
              className={cn(
                'w-full flex items-center gap-3.5 px-[18px] py-3.5 text-left transition-colors hover:bg-primary-tint/30 active:bg-primary-tint/50',
                !isLast && 'border-b border-sep',
              )}
            >
              <div
                className={cn(
                  'flex-shrink-0 w-9 h-9 rounded-sm flex items-center justify-center',
                  isSaved ? 'bg-gold-tint' : 'bg-coral-tint',
                )}
              >
                {isSaved ? <CheckIcon /> : <BagIcon />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {isSaved ? 'Saved' : 'Bought'}
                  {item.resolvedAt && ` · ${relativeTime(item.resolvedAt)}`}
                </p>
              </div>

              <div className="flex-shrink-0 flex items-center gap-2">
                <span
                  className={cn(
                    'text-sm font-semibold tabular-nums',
                    isSaved ? 'text-primary' : 'text-coral-deep',
                  )}
                >
                  {isSaved ? '+' : ''}
                  {fmtRM(item.amountCents, 0)}
                </span>
                <Pencil size={13} className="text-subtle-foreground" />
              </div>
            </button>
          )
        })}
      </Card>
    </section>
  )
}
