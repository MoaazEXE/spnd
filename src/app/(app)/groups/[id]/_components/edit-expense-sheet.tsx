'use client'

import { useActionState, useEffect, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { editExpense, deleteExpense } from '@/app/actions/groups'
import { Card } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ErrorBanner } from '@/components/ui/error-banner'
import { SheetFrame } from '@/components/ui/sheet-frame'
import { fmtRM } from '@/lib/formatters'

interface Props {
  expenseId: string
  initialDescription: string
  initialAmountCents: number
  shareCount: number
  memberCount: number
  payerName: string
  isSettlement: boolean
  onClose: () => void
}

export function EditExpenseSheet({
  expenseId,
  initialDescription,
  initialAmountCents,
  shareCount,
  memberCount,
  payerName,
  isSettlement,
  onClose,
}: Props) {
  const [error, action, isPending] = useActionState(editExpense, null)
  const [description, setDescription] = useState(initialDescription)
  const [amountCents, setAmountCents] = useState(initialAmountCents)
  const [resplit, setResplit] = useState(false)
  const [isDeleting, startDelete] = useTransition()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const wasPending = useRef(false)

  useEffect(() => {
    if (wasPending.current && !isPending && error === null) {
      toast.success('Activity updated')
      onClose()
    }
    wasPending.current = isPending
  }, [isPending, error, onClose])

  const shareCountActive = resplit ? memberCount : shareCount
  const perPersonCents =
    shareCountActive > 0 ? Math.floor(amountCents / shareCountActive) : 0
  const canSubmit = description.trim().length > 0 && amountCents > 0

  function doDelete() {
    const fd = new FormData()
    fd.set('expenseId', expenseId)
    startDelete(async () => {
      try {
        await deleteExpense(fd)
        toast.success('Activity deleted')
        onClose()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Could not delete activity.'
        if (!msg.includes('NEXT_REDIRECT')) toast.error(msg)
      } finally {
        setConfirmingDelete(false)
      }
    })
  }

  return (
    <SheetFrame
      title={isSettlement ? 'Settlement' : 'Edit activity'}
      onClose={onClose}
      size="tall"
      footer={
        isSettlement ? (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            disabled={isDeleting}
            className="w-full h-14 rounded-xl bg-coral-tint text-coral-deep text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-40 inline-flex items-center justify-center gap-2"
          >
            <Trash2 size={16} strokeWidth={1.8} />
            {isDeleting ? 'Removing…' : 'Remove settlement'}
          </button>
        ) : (
          <button
            form="edit-expense-form"
            type="submit"
            disabled={isPending || !canSubmit}
            className="w-full h-14 rounded-xl bg-primary text-primary-foreground text-base font-semibold transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? 'Saving…' : 'Save changes'}
          </button>
        )
      }
    >
      {isSettlement ? (
        <div className="px-5 pb-5 space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Settlements record that money already changed hands. Editing them would unbalance
            past splits — you can only remove a settlement if it was wrong.
          </p>
          <Card padding="sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Paid by
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">{payerName}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Amount
            </p>
            <p className="mt-1 text-lg font-bold text-foreground tabular-nums">
              {fmtRM(amountCents)}
            </p>
          </Card>
        </div>
      ) : (
        <form action={action} id="edit-expense-form" className="px-5 pb-4 space-y-5">
          <input type="hidden" name="expenseId" value={expenseId} />
          <input type="hidden" name="resplit" value={resplit ? '1' : '0'} />

          <Card className="text-center" padding="md">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              How much?
            </p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-2xl font-semibold text-muted-foreground tracking-tight">
                RM
              </span>
              <input
                name="amount"
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                required
                defaultValue={(initialAmountCents / 100).toString()}
                onChange={e =>
                  setAmountCents(Math.round(parseFloat(e.target.value || '0') * 100))
                }
                className="w-44 text-center text-5xl font-bold text-foreground tabular-nums tracking-tight bg-transparent border-none outline-none placeholder:text-muted-foreground/40"
              />
            </div>
            {amountCents > 0 && (
              <p className="mt-3 text-xs text-muted-foreground tabular-nums animate-fade-in">
                {fmtRM(perPersonCents, 0)} each · split across {shareCountActive}{' '}
                {shareCountActive === 1 ? 'person' : 'people'}
              </p>
            )}
          </Card>

          <div className="space-y-2">
            <label
              htmlFor="edit-desc"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              What was it?
            </label>
            <input
              id="edit-desc"
              name="description"
              type="text"
              required
              maxLength={80}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full h-13 px-4 rounded-lg bg-background border border-border text-base font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            />
          </div>

          <label
            className={
              'flex items-start gap-3 rounded-2xl border px-4 py-3.5 cursor-pointer transition-colors ' +
              (resplit
                ? 'border-primary bg-primary-tint'
                : 'border-border bg-card hover:bg-muted')
            }
          >
            <input
              type="checkbox"
              checked={resplit}
              onChange={e => setResplit(e.target.checked)}
              className="mt-0.5 accent-primary"
            />
            <span className="flex-1">
              <span className="block text-sm font-semibold text-foreground">
                Re-split equally across current members
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {shareCount === memberCount
                  ? 'Everyone already shares this. Toggle on to refresh the split using the new amount.'
                  : `This was split between ${shareCount} people. There are ${memberCount} in the group now — toggling on includes everyone equally.`}
              </span>
            </span>
          </label>

          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            disabled={isDeleting}
            className="w-full h-12 rounded-lg text-coral-deep text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-coral-tint transition-colors disabled:opacity-50"
          >
            <Trash2 size={16} strokeWidth={1.8} />
            {isDeleting ? 'Deleting…' : 'Delete activity'}
          </button>

          <ErrorBanner message={error} />
        </form>
      )}

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this activity?"
        description="Balances adjust automatically. There's no undo."
        confirmLabel="Delete"
        destructive
        busy={isDeleting}
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={doDelete}
      />
    </SheetFrame>
  )
}
