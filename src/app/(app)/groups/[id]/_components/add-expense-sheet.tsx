'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Check } from 'lucide-react'
import { addExpense } from '@/app/actions/groups'
import { Avatar } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { ErrorBanner } from '@/components/ui/error-banner'
import { SheetFrame } from '@/components/ui/sheet-frame'
import { useFmt, useCurrency } from '@/lib/currency-context'
import { CURRENCIES } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import type { GroupGuestView, GroupActivityView } from '../page'

interface MemberOption {
  id: string
  name: string
  avatarUrl: string | null
  isYou: boolean
}

interface Props {
  groupId: string
  members: MemberOption[]
  guests: GroupGuestView[]
  onClose: () => void
  onExpenseAdded?: (expense: GroupActivityView) => void
}

export function AddExpenseSheet({ groupId, members, guests, onClose, onExpenseAdded }: Props) {
  const fmt = useFmt()
  const currencyCode = useCurrency()
  const currencySymbol = CURRENCIES.find(c => c.code === currencyCode)?.symbol ?? currencyCode
  const [error, action, isPending] = useActionState(addExpense, null)
  const [amountCents, setAmountCents] = useState(0)
  const [description, setDescription] = useState('')
  const [participants, setParticipants] = useState<Set<string>>(
    () => new Set(members.map(m => m.id)),
  )
  // Default to all guests selected too, matching the "everyone" mental model.
  // Without this, a new expense silently excludes guests and the activity
  // shows "split 1 way" even when a guest is in the group.
  const [guestParticipants, setGuestParticipants] = useState<Set<string>>(
    () => new Set(guests.map(g => g.id)),
  )
  const [payerId, setPayerId] = useState<string>(() => members.find(m => m.isYou)?.id ?? members[0]?.id ?? '')
  const [payerIsGuest, setPayerIsGuest] = useState(false)
  const wasPending = useRef(false)

  const totalParticipants = participants.size + guestParticipants.size

  useEffect(() => {
    if (wasPending.current && !isPending && error === null) {
      const totalMembers = members.length + guests.length
      const payerMember = members.find(m => m.id === payerId)
      onExpenseAdded?.({
        id: `opt-${Date.now()}`,
        type: 'split',
        title: description || 'Expense',
        description: description || 'Expense',
        amountCents,
        perPersonCents: totalParticipants > 0 ? Math.floor(amountCents / totalParticipants) : 0,
        payerId,
        payerName: payerMember?.isYou ? 'You' : (payerMember?.name ?? 'Someone'),
        shareCount: totalParticipants,
        createdAt: new Date().toISOString(),
      })
      toast.success(`${description || 'Expense'} split`, {
        description:
          totalParticipants === totalMembers
            ? `Across all ${totalMembers} ${totalMembers === 1 ? 'person' : 'people'}.`
            : `Across ${totalParticipants} of ${totalMembers} people.`,
      })
      onClose()
    }
    wasPending.current = isPending
  }, [isPending, error, onClose, onExpenseAdded, description, amountCents, totalParticipants, payerId, members, guests.length])

  function toggleMember(id: string) {
    setParticipants(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleGuest(id: string) {
    setGuestParticipants(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    setParticipants(new Set(members.map(m => m.id)))
    setGuestParticipants(new Set(guests.map(g => g.id)))
  }

  function justMe() {
    const me = members.find(m => m.isYou)
    setParticipants(me ? new Set([me.id]) : new Set())
    setGuestParticipants(new Set())
  }

  const perPersonCents =
    totalParticipants > 0 ? Math.floor(amountCents / totalParticipants) : 0
  const canSubmit =
    description.trim().length > 0 && amountCents > 0 && totalParticipants > 0
  const allSelected =
    participants.size === members.length && guestParticipants.size === guests.length

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
        <input type="hidden" name="payerId" value={payerIsGuest ? '' : payerId} />
        <input type="hidden" name="guestPayerId" value={payerIsGuest ? payerId : ''} />
        {Array.from(participants).map(id => (
          <input key={id} type="hidden" name="participants" value={id} />
        ))}
        {Array.from(guestParticipants).map(id => (
          <input key={id} type="hidden" name="guestParticipants" value={id} />
        ))}

        <Card className="text-center" padding="md">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            How much?
          </p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-2xl font-semibold text-muted-foreground tracking-tight">{currencySymbol}</span>
            <input
              name="amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0"
              required
              onChange={e =>
                setAmountCents(Math.round(parseFloat(e.target.value || '0') * 100))
              }
              className="w-44 text-center text-5xl font-bold text-foreground tabular-nums tracking-tight bg-transparent border-none outline-none placeholder:text-muted-foreground/40"
            />
          </div>
          {amountCents > 0 && totalParticipants > 0 && (
            <p className="mt-3 text-xs text-muted-foreground tabular-nums animate-fade-in">
              {fmt(perPersonCents, 0)} each · split across {totalParticipants}{' '}
              {totalParticipants === 1 ? 'person' : 'people'}
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
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Who paid?
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {members.map(m => {
              const selected = !payerIsGuest && payerId === m.id
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => { setPayerId(m.id); setPayerIsGuest(false) }}
                  className={cn(
                    'flex-shrink-0 flex flex-col items-center gap-1.5 rounded-lg px-3 py-2.5 border transition-colors',
                    selected
                      ? 'border-primary bg-primary-tint'
                      : 'border-border bg-card hover:bg-muted',
                  )}
                >
                  <Avatar name={m.name} src={m.avatarUrl} size={28} />
                  <span className="text-[11px] font-semibold text-foreground truncate max-w-[64px]">
                    {m.isYou ? 'You' : m.name}
                  </span>
                </button>
              )
            })}
            {guests.map(g => {
              const selected = payerIsGuest && payerId === g.id
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => { setPayerId(g.id); setPayerIsGuest(true) }}
                  className={cn(
                    'flex-shrink-0 flex flex-col items-center gap-1.5 rounded-lg px-3 py-2.5 border transition-colors',
                    selected
                      ? 'border-primary bg-primary-tint'
                      : 'border-border bg-card hover:bg-muted',
                  )}
                >
                  <Avatar name={g.name} size={28} />
                  <span className="text-[11px] font-semibold text-foreground truncate max-w-[64px]">
                    {g.name}
                  </span>
                </button>
              )
            })}
          </div>
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
                  onClick={() => toggleMember(m.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 border transition-colors text-left',
                    checked
                      ? 'border-primary bg-primary-tint'
                      : 'border-border bg-card hover:bg-muted',
                  )}
                >
                  <Avatar name={m.name} src={m.avatarUrl} size={28} />
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
            {guests.map(g => {
              const checked = guestParticipants.has(g.id)
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => toggleGuest(g.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 border transition-colors text-left',
                    checked
                      ? 'border-primary bg-primary-tint'
                      : 'border-border bg-card hover:bg-muted',
                  )}
                >
                  <Avatar name={g.name} size={28} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{g.name}</p>
                    <p className="text-[10px] text-muted-foreground">Guest</p>
                  </div>
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
          {totalParticipants === 0 && (
            <p className="text-xs text-coral-deep">Pick at least one person.</p>
          )}
        </div>

        <ErrorBanner message={error} />
      </form>
    </SheetFrame>
  )
}
