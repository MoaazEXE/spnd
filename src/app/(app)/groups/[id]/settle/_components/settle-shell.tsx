'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Sparkles, Check, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { useFmt } from '@/lib/currency-context'
import { cn } from '@/lib/utils'
import { settleGroup } from '@/app/actions/groups'

export interface PlanRow {
  fromId: string
  fromLabel: string
  fromAvatarUrl: string | null
  toId: string
  toLabel: string
  toAvatarUrl: string | null
  amountCents: number
  // Who's allowed to confirm this row.
  involvesYou: boolean
  youArePayer: boolean
}

export interface EvidenceRow {
  id: string
  title: string
  payerName: string
  shareCount: number
  amountCents: number
}

interface Props {
  groupId: string
  groupName: string
  plan: PlanRow[]
  evidence: EvidenceRow[]
}

export function SettleShell({ groupId, groupName, plan, evidence }: Props) {
  const fmt = useFmt()
  // Default-checked: rows you pay. Incoming rows (someone owes you) default OFF
  // until you explicitly confirm receipt.
  const [confirmed, setConfirmed] = useState<Set<string>>(
    () => new Set(plan.filter(r => r.youArePayer).map(rowKey)),
  )
  const [submitting, startSubmit] = useTransition()

  const youInvolved = plan.filter(r => r.involvesYou)
  const othersOnly = plan.filter(r => !r.involvesYou)

  function toggle(key: string) {
    setConfirmed(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function submit() {
    if (confirmed.size === 0) {
      toast.error('Tick at least one payment to mark as paid.')
      return
    }
    const fd = new FormData()
    fd.set('groupId', groupId)
    for (const k of confirmed) fd.append('confirm', k)
    startSubmit(async () => {
      try {
        await settleGroup(fd)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Could not record payments.'
        if (!msg.includes('NEXT_REDIRECT')) toast.error(msg)
      }
    })
  }

  return (
    <div className="max-w-[640px] mx-auto px-5 lg:px-12 pt-4 lg:pt-8 pb-32 lg:pb-16">
      <div className="mb-3">
        <Link
          href={`/groups/${groupId}`}
          prefetch
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={2} />
          {groupName}
        </Link>
      </div>

      <h1 className="font-display text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
        Settle up
      </h1>

      {plan.length === 0 ? (
        <Card className="mt-5 text-center py-10" padding="none">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary-tint flex items-center justify-center text-primary mb-3">
            <Check size={20} strokeWidth={2} />
          </div>
          <p className="text-sm font-semibold text-foreground">Everyone&apos;s already even.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            No outstanding balances in this group.
          </p>
        </Card>
      ) : (
        <>
          <div className="mt-4 mb-5 flex items-start gap-3 bg-primary-tint rounded-2xl p-4">
            <Sparkles size={18} strokeWidth={1.8} className="text-primary-deep mt-0.5 flex-shrink-0" />
            <p className="text-xs text-primary-deep leading-relaxed">
              Simplified to the fewest possible payments. Just{' '}
              <strong>
                {plan.length} {plan.length === 1 ? 'transfer' : 'transfers'}
              </strong>{' '}
              and everyone&apos;s even. Tick the ones that have actually happened.
            </p>
          </div>

          {youInvolved.length > 0 && (
            <>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Payments
              </p>
              <Card padding="none">
                {youInvolved.map((row, i) => (
                  <PaymentRow
                    key={rowKey(row)}
                    row={row}
                    checked={confirmed.has(rowKey(row))}
                    onToggle={() => toggle(rowKey(row))}
                    last={i === youInvolved.length - 1}
                  />
                ))}
              </Card>
            </>
          )}

          {othersOnly.length > 0 && (
            <>
              <p className="mt-5 mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Between other members
              </p>
              <Card padding="none">
                {othersOnly.map((row, i) => (
                  <div
                    key={rowKey(row)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3.5 opacity-70',
                      i < othersOnly.length - 1 && 'border-b border-sep',
                    )}
                  >
                    <Avatar name={row.fromLabel} src={row.fromAvatarUrl} size={32} />
                    <p className="flex-1 min-w-0 text-xs text-muted-foreground truncate">
                      <span className="font-semibold text-foreground">{row.fromLabel}</span>{' '}
                      pays{' '}
                      <span className="font-semibold text-foreground">{row.toLabel}</span>
                    </p>
                    <p className="text-sm font-bold text-foreground tabular-nums">
                      {fmt(row.amountCents)}
                    </p>
                  </div>
                ))}
              </Card>
              <p className="mt-2 text-[11px] text-subtle-foreground">
                You can only confirm payments that involve you. They&apos;ll mark theirs when it
                happens.
              </p>
            </>
          )}

          {evidence.length > 0 && (
            <>
              <p className="mt-7 mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                How we got there
              </p>
              <Card padding="none">
                {evidence.map((e, i) => (
                  <div
                    key={e.id}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3.5',
                      i < evidence.length - 1 && 'border-b border-sep',
                    )}
                  >
                    <div className="w-9 h-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0">
                      <ShoppingBag size={15} strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{e.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {e.payerName} paid · split {e.shareCount}{' '}
                        {e.shareCount === 1 ? 'way' : 'ways'}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-foreground tabular-nums">
                      {fmt(e.amountCents, 0)}
                    </p>
                  </div>
                ))}
              </Card>
            </>
          )}

          <div className="fixed lg:static bottom-[60px] lg:bottom-auto inset-x-0 lg:inset-auto px-5 lg:px-0 py-3 lg:py-0 lg:mt-6 bg-background lg:bg-transparent border-t lg:border-t-0 border-sep z-10">
            <div className="max-w-[640px] mx-auto flex gap-2.5">
              <Link
                href={`/groups/${groupId}`}
                className="flex-1 h-12 rounded-lg inline-flex items-center justify-center text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </Link>
              <button
                type="button"
                onClick={submit}
                disabled={submitting || confirmed.size === 0}
                className="flex-[1.4] h-12 rounded-lg bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-primary-deep transition-colors active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Check size={16} strokeWidth={2} />
                {submitting
                  ? 'Recording…'
                  : `Mark ${confirmed.size} as paid`}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function rowKey(r: { fromId: string; toId: string; amountCents: number }): string {
  return `${r.fromId}:${r.toId}:${r.amountCents}`
}

function PaymentRow({
  row,
  checked,
  onToggle,
  last,
}: {
  row: PlanRow
  checked: boolean
  onToggle: () => void
  last: boolean
}) {
  const fmt = useFmt()
  const helper = row.youArePayer
    ? 'You pay them'
    : `Confirm ${row.fromLabel} has paid you`

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left',
        checked ? 'bg-primary-tint/40' : 'hover:bg-muted',
        !last && 'border-b border-sep',
      )}
    >
      <Avatar name={row.fromLabel} src={row.fromAvatarUrl} size={36} />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-muted-foreground">
          {row.youArePayer ? 'You pay' : `${row.fromLabel} pays`}
        </p>
        <p className="text-sm font-semibold text-foreground truncate">
          {row.youArePayer ? row.toLabel : 'You'}
        </p>
        <p className="text-[10px] text-subtle-foreground mt-0.5">{helper}</p>
      </div>
      <div className="w-7 h-7 rounded-full bg-primary-tint text-primary flex items-center justify-center flex-shrink-0">
        <ArrowRight size={14} strokeWidth={2} />
      </div>
      <Avatar name={row.youArePayer ? row.toLabel : 'You'} src={row.toAvatarUrl} size={36} />
      <p className="text-base font-bold text-foreground tabular-nums flex-shrink-0 min-w-[72px] text-right">
        {fmt(row.amountCents)}
      </p>
      <span
        className={cn(
          'flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-colors',
          checked ? 'bg-primary text-primary-foreground' : 'border border-border bg-card',
        )}
      >
        {checked && <Check size={14} strokeWidth={2.5} />}
      </span>
    </button>
  )
}
