'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { getCoolingStatus } from '@/core/cooling/coolingState'
import { fmtRM } from '@/lib/formatters'
import { useResolveSheet } from './resolve-sheet-context'

interface CoolingItem {
  id: string
  title: string
  amountCents: number
  coolingUntil: Date
}

interface Props {
  items: CoolingItem[]
}

export function NotificationBell({ items }: Props) {
  const [open, setOpen] = useState(false)
  const [now, setNow] = useState(() => new Date())
  const resolveSheet = useResolveSheet()
  const popRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Re-evaluate readiness every 30s
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  // Close on outside click
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
    i => getCoolingStatus({ status: 'COOLING', coolingUntil: i.coolingUntil }, now) === 'READY_TO_RESOLVE'
  )

  function handleClick(id: string) {
    setOpen(false)
    resolveSheet.open(id)
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(v => !v)}
        aria-label="Notifications"
        className="relative w-10 h-10 rounded-[12px] flex items-center justify-center hover:bg-[rgba(31,42,46,0.05)] transition-colors"
      >
        <Bell size={18} strokeWidth={1.8} className="text-[var(--text-muted)]" />
        {ready.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--gold)] ring-2 ring-background" />
        )}
      </button>

      {open && (
        <div
          ref={popRef}
          className="fixed lg:absolute left-3 right-3 top-[68px] lg:left-auto lg:right-0 lg:top-full lg:mt-2 lg:w-[340px] bg-card rounded-[16px] shadow-[0_12px_40px_rgba(31,42,46,0.18)] border border-[var(--sep)] overflow-hidden z-50 animate-fade-in"
        >
          <div className="px-4 py-3 border-b border-[var(--sep)] flex items-center justify-between">
            <p className="text-[13px] font-semibold text-foreground">Notifications</p>
            {ready.length > 0 && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--gold-tint)] text-[var(--gold-deep)]">
                {ready.length} ready
              </span>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {ready.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="w-10 h-10 rounded-full bg-[var(--primary-tint)] flex items-center justify-center mx-auto mb-2">
                  <Bell size={16} strokeWidth={1.8} className="text-primary" />
                </div>
                <p className="text-[13px] text-[var(--text-muted)]">You&apos;re all caught up.</p>
                <p className="text-[12px] text-[var(--text-subtle)] mt-0.5">We&apos;ll ping you when cooling timers finish.</p>
              </div>
            ) : (
              <ul>
                {ready.map(item => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleClick(item.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--primary-tint)]/40 transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-[10px] bg-[var(--gold-tint)] flex items-center justify-center flex-shrink-0">
                        <span className="text-[var(--gold-deep)]">✦</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-foreground truncate">{item.title}</p>
                        <p className="text-[12px] text-[var(--gold-deep)] font-medium">Ready to decide</p>
                      </div>
                      <span className="text-[13px] font-semibold text-foreground tabular-nums flex-shrink-0">
                        {fmtRM(item.amountCents, 0)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
