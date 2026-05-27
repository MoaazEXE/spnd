'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { Bell, Users, ShoppingBag } from 'lucide-react'
import { getCoolingStatus } from '@/core/cooling/coolingState'
import { fmtRM } from '@/lib/formatters'
import { useTick } from '@/lib/use-tick'
import { acceptInvite, rejectInvite } from '@/app/actions/groups'
import { useResolveSheet } from './resolve-sheet-context'

interface CoolingItem {
  id: string
  title: string
  amountCents: number
  coolingUntil: Date
}

export interface PendingInvite {
  groupId: string
  groupName: string
  memberCount: number
}

export interface GroupExpenseNotif {
  id: string
  description: string
  amountCents: number
  payerName: string
  groupId: string
  groupName: string
  createdAt: Date
}

interface Props {
  items: CoolingItem[]
  invites: PendingInvite[]
  groupExpenses: GroupExpenseNotif[]
}

export function NotificationBell({ items, invites, groupExpenses }: Props) {
  const [open, setOpen] = useState(false)
  const now = useTick(30_000)
  const resolveSheet = useResolveSheet()
  const popRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [pendingId, startTransition] = useTransition()
  const [actingOn, setActingOn] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (popRef.current?.contains(e.target as Node)) return
      if (buttonRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const ready = items.filter(
    i => getCoolingStatus({ status: 'COOLING', coolingUntil: i.coolingUntil }, now) === 'READY_TO_RESOLVE',
  )

  const totalCount = ready.length + invites.length + groupExpenses.length

  function handleClick(id: string) {
    setOpen(false)
    resolveSheet.open(id)
  }

  function handleAccept(groupId: string) {
    setActingOn(groupId)
    const fd = new FormData()
    fd.set('groupId', groupId)
    startTransition(async () => {
      await acceptInvite(fd)
      setActingOn(null)
    })
  }

  function handleReject(groupId: string) {
    setActingOn(groupId)
    const fd = new FormData()
    fd.set('groupId', groupId)
    startTransition(async () => {
      await rejectInvite(fd)
      setActingOn(null)
    })
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(v => !v)}
        aria-label="Notifications"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative w-11 h-11 rounded-md flex items-center justify-center hover:bg-foreground/5 transition-colors"
      >
        <Bell size={18} strokeWidth={1.8} className="text-muted-foreground" />
        {totalCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold ring-2 ring-background" />
        )}
      </button>

      {open && (
        <div
          ref={popRef}
          role="dialog"
          className="fixed lg:absolute left-3 right-3 top-[68px] lg:left-auto lg:right-0 lg:top-full lg:mt-2 lg:w-[360px] bg-card rounded-xl shadow-pop border border-sep overflow-hidden z-50 animate-fade-in"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-sep">
            <p className="text-xs font-semibold text-foreground">Notifications</p>
            {totalCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-gold-tint text-gold-deep text-[11px] font-semibold">
                {totalCount} new
              </span>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {invites.length > 0 && (
              <>
                <p className="px-4 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Group invites
                </p>
                <ul className="pb-1">
                  {invites.map(inv => {
                    const busy = pendingId && actingOn === inv.groupId
                    return (
                      <li key={inv.groupId} className="px-4 py-3 border-b border-sep last:border-b-0">
                        <div className="flex items-center gap-3 mb-2.5">
                          <div className="flex-shrink-0 w-9 h-9 rounded-sm bg-primary-tint flex items-center justify-center text-primary-deep">
                            <Users size={16} strokeWidth={1.8} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {inv.groupName}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {inv.memberCount} {inv.memberCount === 1 ? 'member' : 'members'} ·
                              invited you
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleReject(inv.groupId)}
                            disabled={!!busy}
                            className="flex-1 h-11 lg:h-9 rounded-md text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
                          >
                            {busy ? '…' : 'Reject'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAccept(inv.groupId)}
                            disabled={!!busy}
                            className="flex-1 h-11 lg:h-9 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-deep transition-colors disabled:opacity-50"
                          >
                            {busy ? '…' : 'Accept'}
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}

            {groupExpenses.length > 0 && (
              <>
                <p className="px-4 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Group activity
                </p>
                <ul className="pb-1">
                  {groupExpenses.map(exp => (
                    <li key={exp.id} className="border-b border-sep last:border-b-0">
                      <a
                        href={`/groups/${exp.groupId}`}
                        onClick={() => setOpen(false)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
                      >
                        <div className="flex-shrink-0 w-9 h-9 rounded-sm bg-coral-tint flex items-center justify-center text-coral-deep">
                          <ShoppingBag size={15} strokeWidth={1.8} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {exp.description}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {exp.payerName} · {exp.groupName}
                          </p>
                        </div>
                        <span className="flex-shrink-0 text-xs font-semibold text-foreground tabular-nums">
                          {fmtRM(exp.amountCents, 0)}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {ready.length > 0 && (
              <>
                {invites.length > 0 && (
                  <p className="px-4 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Ready to decide
                  </p>
                )}
                <ul>
                  {ready.map(item => (
                    <li key={item.id}>
                      <button
                        onClick={() => handleClick(item.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-tint/40 transition-colors text-left"
                      >
                        <div className="flex-shrink-0 w-9 h-9 rounded-sm bg-gold-tint flex items-center justify-center">
                          <span className="text-gold-deep">✦</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {item.title}
                          </p>
                          <p className="text-[11px] font-medium text-gold-deep">Ready to decide</p>
                        </div>
                        <span className="flex-shrink-0 text-xs font-semibold text-foreground tabular-nums">
                          {fmtRM(item.amountCents, 0)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {totalCount === 0 && (
              <div className="px-4 py-8 text-center">
                <div className="mx-auto mb-2 w-10 h-10 rounded-full bg-primary-tint flex items-center justify-center">
                  <Bell size={16} strokeWidth={1.8} className="text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">You&apos;re all caught up.</p>
                <p className="mt-0.5 text-[11px] text-subtle-foreground">
                  Cooling timers and group invites will land here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
