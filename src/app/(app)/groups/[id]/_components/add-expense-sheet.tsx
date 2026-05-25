'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Check } from 'lucide-react'
import { addExpense } from '@/app/actions/groups'
import { Avatar } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { ErrorBanner } from '@/components/ui/error-banner'
import { SheetFrame } from '@/components/ui/sheet-frame'
import { fmtRM } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface MemberOption {
  id: string
  name: string
  isYou: boolean
}

interface Props {
  groupId: string
  members: MemberOption[]
  onClose: () => void
}

export function AddExpenseSheet({ groupId, members, onClose }: Props) {
  const [error, action, isPending] = useActionState(addExpense, null)
  const [amountCents, setAmountCents] = useState(0)
  const [description, setDescription] = useState('')
  const [participants, setParticipants] = useState<Set<string>>(
    () => new Set(members.map(m => m.id)),
  )
  const wasPending = useRef(false)

  useEffect(() => {
    if (wasPending.current && !isPending && error === null) {
      toast.success(`${description || 'Expense'} split`, {
        description:
          participants.size === members.length
            ? `Across all ${members.length} ${members.length === 1 ? 'person' : 'people'}.`
            : `Across ${participants.size} of ${members.length} people.`,
      })
      onClose()
    }
    wasPending.current = isPending
  }, [isPending, error, onClose, description, participants.size, members.length])

  function toggle(id: string) {
    setParticipants(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    setParticipants(new Set(members.map(m => m.id)))
  }

  function justMe() {
    const me = members.find(m => m.isYou)
    setParticipants(me ? new Set([me.id]) : new Set())
  }

  const participantCount = participants.size
  const perPersonCents =
    participantCount > 0 ? Math.floor(amountCents / participantCount) : 0
  const canSubmit =
    description.trim().length > 0 && amountCents > 0 && participantCount > 0
  const allSelected = participantCount === members.length

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
        {Array.from(participants).map(id => (
          <input key={id} type="hidden" name="participants" value={id} />
        ))}

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
          {amountCents > 0 && participantCount > 0 && (
            <p className="mt-3 text-xs text-muted-foreground tabular-nums animate-fade-in">
              {fmtRM(perPersonCents, 0)} each · split across {participantCount}{' '}
              {participantCount === 1 ? 'person' : 'people'}
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Split with
            </label>
            <div className="flex gap-1 text-[11px] font-semibold">
              <button
                type="button"
                onClick={selectAll}
                className={cn(
                  'px-2 py-1 rounded-md transition-colors',
                  allSelected
                    ? 'bg-primary-tint text-primary-deep'
                    : 'text-muted-foreground hover:bg-muted',
                )}
              >
                Everyone
              </button>
              <button
                type="button"
                onClick={justMe}
                className="px-2 py-1 rounded-md text-muted-foreground hover:bg-muted transition-colors"
              >
                Just me
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {members.map(m => {
              const checked = participants.has(m.id)
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggle(m.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 border transition-colors text-left',
                    checked
                      ? 'border-primary bg-primary-tint'
                      : 'border-border bg-card hover:bg-muted',
                  )}
                >
                  <Avatar name={m.name} size={28} />
                  <span className="flex-1 min-w-0 text-sm font-semibold text-foreground truncate">
                    {m.name}
                  </span>
                  <span
                    className={cn(
                      'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors',
                      checked ? 'bg-primary text-primary-foreground' : 'border border-border',
                    )}
                  >
                    {checked && <Check size={12} strokeWidth={2.5} />}
                  </span>
                </button>
              )
            })}
          </div>
          {participantCount === 0 && (
            <p className="text-xs text-coral-deep">Pick at least one person.</p>
          )}
        </div>

        <ErrorBanner message={error} />
      </form>
    </SheetFrame>
  )
}
