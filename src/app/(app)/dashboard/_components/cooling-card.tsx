'use client'

import { useState, useEffect } from 'react'
import { getCoolingStatus } from '@/core/cooling/coolingState'
import { fmtRM, fmtCountdown } from '@/lib/formatters'

interface CoolingCardItem {
  id: string
  title: string
  amountCents: number
  coolingUntil: Date
  createdAt: Date
}

interface Props {
  item: CoolingCardItem
  timeCostFormatted?: string
  onResolve: (id: string) => void
  size?: 'sm' | 'lg'
}

// Circular countdown SVG — desktop (lg) size
function CircularCountdown({ progress, isReady }: { progress: number; isReady: boolean }) {
  const r = 20, cx = 28, cy = 28
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - progress / 100)

  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      {/* Pulse ring — only when ready */}
      {isReady && (
        <div
          className="animate-pulse-ring absolute inset-0 rounded-full"
          style={{ background: 'rgba(201,169,97,0.35)' }}
        />
      )}
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={isReady ? 'rgba(201,169,97,0.2)' : 'var(--primary-tint)'} strokeWidth="3.5" />
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={isReady ? '#C9A961' : '#2D5F5B'}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      {isReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12l4.5 4.5L19 7" stroke="#A8893E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  )
}

export function CoolingCard({ item, timeCostFormatted, onResolve, size = 'sm' }: Props) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1_000)
    return () => clearInterval(id)
  }, [])

  const status = getCoolingStatus({ status: 'COOLING', coolingUntil: item.coolingUntil }, now)
  const isReady = status === 'READY_TO_RESOLVE'
  const remainingMs = Math.max(0, item.coolingUntil.getTime() - now.getTime())
  const totalMs = item.coolingUntil.getTime() - item.createdAt.getTime()
  const progress = totalMs > 0 ? Math.min(100, ((totalMs - remainingMs) / totalMs) * 100) : 100

  if (size === 'lg') {
    return (
      <button
        onClick={() => onResolve(item.id)}
        className={[
          'w-full text-left rounded-[20px] p-5 transition-all duration-200 ease-out',
          'shadow-[0_1px_2px_rgba(31,42,46,0.04),0_4px_16px_rgba(31,42,46,0.04)]',
          'hover:-translate-y-[3px] hover:shadow-[0_4px_8px_rgba(31,42,46,0.05),0_16px_32px_rgba(31,42,46,0.10)]',
          'active:translate-y-0 active:shadow-[0_1px_2px_rgba(31,42,46,0.04),0_4px_16px_rgba(31,42,46,0.04)]',
          isReady ? 'border-[1.5px] border-[var(--gold)] bg-[var(--gold-tint)]' : 'border border-transparent bg-card',
        ].join(' ')}
      >
        <div className="flex items-start gap-4">
          <CircularCountdown progress={progress} isReady={isReady} />

          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-foreground truncate">{item.title}</p>
            <p className="text-[22px] font-bold tabular-nums tracking-[-0.8px] text-foreground mt-0.5">
              {fmtRM(item.amountCents, 0)}
            </p>
            {timeCostFormatted && (
              <p className="text-[12px] text-[var(--text-muted)] mt-0.5">≈ {timeCostFormatted} of your time</p>
            )}
            <p className={['text-[12px] font-medium mt-1.5', isReady ? 'text-[var(--gold-deep)] font-semibold' : 'text-[var(--text-muted)]'].join(' ')}>
              {isReady ? '✦ Ready to decide' : fmtCountdown(remainingMs)}
            </p>
          </div>
        </div>
      </button>
    )
  }

  // size === 'sm' (mobile default)
  return (
    <button
      onClick={() => onResolve(item.id)}
      className={[
        'w-full text-left rounded-[20px] p-4 transition-all duration-200 ease-out',
        'shadow-[0_1px_2px_rgba(31,42,46,0.04),0_4px_16px_rgba(31,42,46,0.04)]',
        'hover:-translate-y-[3px] hover:shadow-[0_4px_8px_rgba(31,42,46,0.05),0_16px_32px_rgba(31,42,46,0.10)]',
        'active:translate-y-0 active:shadow-[0_1px_2px_rgba(31,42,46,0.04),0_4px_16px_rgba(31,42,46,0.04)]',
        isReady ? 'border-[1.5px] border-[var(--gold)] bg-[var(--gold-tint)]' : 'border border-transparent bg-card',
      ].join(' ')}
    >
      <div className="flex items-center gap-3">
        <div className={[
          'w-11 h-11 rounded-[12px] flex items-center justify-center flex-shrink-0',
          isReady ? 'bg-[var(--gold)] text-white' : 'bg-[var(--primary-tint)] text-primary',
        ].join(' ')}>
          {isReady ? (
            <span className="text-lg">✦</span>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="#2D5F5B" strokeWidth="1.8" />
              <path d="M12 7v5l3 3" stroke="#2D5F5B" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-foreground truncate">{item.title}</p>
          <p className={['text-[13px] font-medium mt-0.5', isReady ? 'text-[var(--gold-deep)] font-semibold' : 'text-[var(--text-muted)]'].join(' ')}>
            {isReady
              ? '✦ Ready to decide'
              : timeCostFormatted
                ? `${fmtCountdown(remainingMs)} · ${timeCostFormatted}`
                : fmtCountdown(remainingMs)
            }
          </p>
        </div>

        <span className="text-[17px] font-bold tabular-nums text-foreground flex-shrink-0">
          {fmtRM(item.amountCents, 0)}
        </span>
      </div>

      <div className={['mt-3 h-1 rounded-full overflow-hidden', isReady ? 'bg-[rgba(201,169,97,0.2)]' : 'bg-[var(--primary-tint)]'].join(' ')}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${isReady ? 'bg-[var(--gold)]' : 'bg-primary'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </button>
  )
}
