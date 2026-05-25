'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { addExpense } from '@/app/actions/groups'
import { Card } from '@/components/ui/card'
import { ErrorBanner } from '@/components/ui/error-banner'
import { SheetFrame } from '@/components/ui/sheet-frame'
import { fmtRM } from '@/lib/formatters'

interface Props {
  groupId: string
  memberCount: number
  onClose: () => void
}

export function AddExpenseSheet({ groupId, memberCount, onClose }: Props) {
  const [error, action, isPending] = useActionState(addExpense, null)
  const [amountCents, setAmountCents] = useState(0)
  const [description, setDescription] = useState('')
  const wasPending = useRef(false)

  useEffect(() => {
    if (wasPending.current && !isPending && error === null) {
      toast.success(`${description || 'Expense'} split`, {
        description: `Across ${memberCount} ${memberCount === 1 ? 'person' : 'people'}.`,
      })
      onClose()
    }
    wasPending.current = isPending
  }, [isPending, error, onClose, description, memberCount])

  const perPersonCents = memberCount > 0 ? Math.floor(amountCents / memberCount) : 0
  const canSubmit = description.trim().length > 0 && amountCents > 0

  return (
    <SheetFrame
      title="Add expense"
      onClose={onClose}
      size="tall"
      footer={
        <button
          form="add-expense-form"
          type="submit"
          disabled={isPending || !canSubmit}
          className="w-full h-14 rounded-xl bg-primary text-primary-foreground text-base font-semibold transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? 'Adding…' : 'Add expense'}
        </button>
      }
    >
      <form action={action} id="add-expense-form" className="px-5 pb-4 space-y-5">
        <input type="hidden" name="groupId" value={groupId} />

        <Card className="text-center" padding="md">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            How much?
          </p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-2xl font-semibold text-muted-foreground tracking-tight">RM</span>
            <input
              name="amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              placeholder="0"
              required
              onChange={e =>
                setAmountCents(Math.round(parseFloat(e.target.value || '0') * 100))
              }
              className="w-44 text-center text-5xl font-bold text-foreground tabular-nums tracking-tight bg-transparent border-none outline-none placeholder:text-muted-foreground/40"
            />
          </div>
          {amountCents > 0 && memberCount > 0 && (
            <p className="mt-3 text-xs text-muted-foreground tabular-nums animate-fade-in">
              {fmtRM(perPersonCents, 0)} per person · split equally
            </p>
          )}
        </Card>

        <div className="space-y-2">
          <label
            htmlFor="expense-desc"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            What is it?
          </label>
          <input
            id="expense-desc"
            name="description"
            type="text"
            required
            maxLength={80}
            placeholder="e.g. Dinner at Hutong"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full h-13 px-4 rounded-lg bg-background border border-border text-base font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          />
        </div>

        <div className="flex items-start gap-3 bg-primary-tint rounded-lg px-4 py-3.5">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className="mt-0.5 flex-shrink-0 text-primary-deep"
          >
            <path d="M12 3l1.8 5.4L19 10.2 13.8 12 12 17.4 10.2 12 5 10.2l5.2-1.8L12 3z" />
          </svg>
          <p className="text-xs text-primary-deep leading-relaxed">
            You paid this one — we&apos;ll split it equally across everyone in the group.
          </p>
        </div>

        <ErrorBanner message={error} />
      </form>
    </SheetFrame>
  )
}
