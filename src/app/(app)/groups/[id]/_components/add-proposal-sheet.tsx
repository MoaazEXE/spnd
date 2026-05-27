'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { proposeGroupCooling } from '@/app/actions/groups'
import { Card } from '@/components/ui/card'
import { ErrorBanner } from '@/components/ui/error-banner'
import { SheetFrame } from '@/components/ui/sheet-frame'
import { useFmt } from '@/lib/currency-context'
import { cn } from '@/lib/utils'

const COOLING_OPTIONS = [
  { label: '1 day', days: 1 },
  { label: '3 days', days: 3 },
  { label: '1 week', days: 7 },
  { label: '2 weeks', days: 14 },
]

interface Props {
  groupId: string
  onClose: () => void
}

export function AddProposalSheet({ groupId, onClose }: Props) {
  const fmt = useFmt()
  const [error, action, isPending] = useActionState(proposeGroupCooling, null)
  const [amountCents, setAmountCents] = useState(0)
  const [description, setDescription] = useState('')
  const [coolingDays, setCoolingDays] = useState(3)
  const [customMode, setCustomMode] = useState(false)
  const [customDays, setCustomDays] = useState('')
  const wasPending = useRef(false)

  useEffect(() => {
    if (wasPending.current && !isPending && error === null) {
      toast.success('Cooling proposal added', {
        description: `The group will wait ${coolingDays} day${coolingDays > 1 ? 's' : ''} before deciding.`,
      })
      onClose()
    }
    wasPending.current = isPending
  }, [isPending, error, onClose, coolingDays])

  const canSubmit = description.trim().length > 0 && amountCents > 0

  return (
    <SheetFrame
      title="Cool on it"
      onClose={onClose}
      size="tall"
      footer={
        <button
          form="add-proposal-form"
          type="submit"
          disabled={isPending || !canSubmit}
          className="w-full h-14 rounded-xl bg-primary text-primary-foreground text-base font-semibold transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? 'Proposing…' : 'Propose cool-off'}
        </button>
      }
    >
      <form action={action} id="add-proposal-form" className="px-5 pb-4 space-y-5">
        <input type="hidden" name="groupId" value={groupId} />
        <input type="hidden" name="coolingDays" value={coolingDays} />

        <div className="rounded-lg bg-primary-tint px-4 py-3.5">
          <p className="text-xs text-primary-deep leading-relaxed">
            Propose a group cool-off — everyone sees the item and reacts before the group commits.
          </p>
        </div>

        <Card className="text-center" padding="md">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            How much?
          </p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-2xl font-semibold text-muted-foreground tracking-tight">
              {fmt(0).split(' ')[0]}
            </span>
            <input
              name="amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              placeholder="0"
              required
              onChange={e => setAmountCents(Math.round(parseFloat(e.target.value || '0') * 100))}
              className="w-44 text-center text-5xl font-bold text-foreground tabular-nums tracking-tight bg-transparent border-none outline-none placeholder:text-muted-foreground/40"
            />
          </div>
          {amountCents > 0 && (
            <p className="mt-2 text-xs text-muted-foreground animate-fade-in">
              {fmt(amountCents)} · shared across all members
            </p>
          )}
        </Card>

        <div className="space-y-2">
          <label
            htmlFor="proposal-desc"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            What is it?
          </label>
          <input
            id="proposal-desc"
            name="description"
            type="text"
            required
            maxLength={80}
            placeholder="e.g. New TV for the living room"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full h-13 px-4 rounded-lg bg-background border border-border text-base font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Cool-off period
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {COOLING_OPTIONS.map(opt => (
              <button
                key={opt.days}
                type="button"
                onClick={() => { setCoolingDays(opt.days); setCustomMode(false) }}
                className={cn(
                  'h-11 rounded-lg border text-sm font-semibold transition-colors',
                  coolingDays === opt.days && !customMode
                    ? 'border-primary bg-primary-tint text-primary-deep'
                    : 'border-border bg-card text-foreground hover:bg-muted',
                )}
              >
                {opt.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCustomMode(true)}
              className={cn(
                'h-11 rounded-lg border text-sm font-semibold transition-colors',
                customMode
                  ? 'border-primary bg-primary-tint text-primary-deep'
                  : 'border-border bg-card text-foreground hover:bg-muted',
              )}
            >
              Custom
            </button>
          </div>
          {customMode && (
            <input
              type="number"
              min="1"
              max="365"
              placeholder="Days"
              value={customDays}
              onChange={e => {
                setCustomDays(e.target.value)
                const n = parseInt(e.target.value, 10)
                if (!isNaN(n) && n >= 1 && n <= 365) setCoolingDays(n)
              }}
              className="w-full h-11 px-4 rounded-lg bg-background border border-border text-base font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            />
          )}
          <p className="text-[11px] text-muted-foreground">
            The group will have {coolingDays} day{coolingDays > 1 ? 's' : ''} to react before you can commit.
          </p>
        </div>

        <ErrorBanner message={error} />
      </form>
    </SheetFrame>
  )
}
