'use client'

import { memo } from 'react'
import { getCoolingStatus } from '@/core/cooling/coolingState'
import { fmtRM, fmtCountdown } from '@/lib/formatters'
import { useTick } from '@/lib/use-tick'
import { cn, toDate } from '@/lib/utils'

interface CoolingCardItem {
  id: string
  title: string
  amountCents: number
  coolingUntil: Date | string
  createdAt: Date | string
}

interface Props {
  item: CoolingCardItem
  timeCostFormatted?: string
  onResolve: (id: string) => void
  size?: 'sm' | 'lg'
}

const CARD_BASE =
  'w-full text-left rounded-2xl transition-all duration-200 ease-out shadow-card hover:-translate-y-[3px] hover:shadow-card-hover active:translate-y-0 active:shadow-card'

function CircularCountdown({ progress, isReady }: { progress: number; isReady: boolean }) {
  const r = 20
  const cx = 28
  const cy = 28
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - progress / 100)

  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      {isReady && (
        <div className="animate-pulse-ring absolute inset-0 rounded-full bg-gold/35" />
      )}
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={isReady ? 'color-mix(in oklab, var(--gold) 20%, transparent)' : 'var(--primary-tint)'}
          strokeWidth="3.5"
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={isReady ? 'var(--gold)' : 'var(--primary)'}
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
            <path
              d="M5 12l4.5 4.5L19 7"
              stroke="var(--gold-deep)"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  )
}

/** Leaf that ticks at 1Hz and renders only the countdown text. */
const CountdownText = memo(function CountdownText({
  coolingUntil,
  createdAt,
  timeCostFormatted,
  size,
}: {
  coolingUntil: Date
  createdAt: Date
  timeCostFormatted?: string
  size: 'sm' | 'lg'
}) {
  const now = useTick(1000)
  const status = getCoolingStatus({ status: 'COOLING', coolingUntil }, now)
  const isReady = status === 'READY_TO_RESOLVE'
  const remainingMs = Math.max(0, coolingUntil.getTime() - now.getTime())
  const totalMs = coolingUntil.getTime() - createdAt.getTime()
  const progress = totalMs > 0 ? Math.min(100, ((totalMs - remainingMs) / totalMs) * 100) : 100

  if (size === 'lg') {
    return (
      <>
        <p className={cn('mt-1.5 text-xs font-medium', isReady ? 'text-gold-deep font-semibold' : 'text-muted-foreground')}>
          {isReady ? '✦ Ready to decide' : fmtCountdown(remainingMs)}
        </p>
      </>
    )
  }

  return (
    <>
      <p className={cn('mt-0.5 text-xs font-medium', isReady ? 'text-gold-deep font-semibold' : 'text-muted-foreground')}>
        {isReady
          ? '✦ Ready to decide'
          : timeCostFormatted
            ? `${fmtCountdown(remainingMs)} · ${timeCostFormatted}`
            : fmtCountdown(remainingMs)}
      </p>
      <div className={cn('mt-3 h-1 rounded-full overflow-hidden', isReady ? 'bg-gold/20' : 'bg-primary-tint')}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', isReady ? 'bg-gold' : 'bg-primary')}
          style={{ width: `${progress}%` }}
        />
      </div>
    </>
  )
})

/** Leaf that ticks at 1Hz for the circular SVG progress ring. */
const CountdownRing = memo(function CountdownRing({
  coolingUntil,
  createdAt,
}: {
  coolingUntil: Date
  createdAt: Date
}) {
  const now = useTick(1000)
  const status = getCoolingStatus({ status: 'COOLING', coolingUntil }, now)
  const isReady = status === 'READY_TO_RESOLVE'
  const remainingMs = Math.max(0, coolingUntil.getTime() - now.getTime())
  const totalMs = coolingUntil.getTime() - createdAt.getTime()
  const progress = totalMs > 0 ? Math.min(100, ((totalMs - remainingMs) / totalMs) * 100) : 100
  return <CircularCountdown progress={progress} isReady={isReady} />
})

export function CoolingCard({ item, timeCostFormatted, onResolve, size = 'sm' }: Props) {
  const coolingUntil = toDate(item.coolingUntil)
  const createdAt = toDate(item.createdAt)

  // Only used for card-level border/icon styling — flips once when cooling ends
  const now = useTick(1000)
  const isReady = getCoolingStatus({ status: 'COOLING', coolingUntil }, now) === 'READY_TO_RESOLVE'

  const readyHighlight = isReady
    ? 'border-[1.5px] border-gold bg-gold-tint'
    : 'border border-transparent bg-card'

  if (size === 'lg') {
    return (
      <button
        onClick={() => onResolve(item.id)}
        className={cn(CARD_BASE, 'p-5', readyHighlight)}
      >
        <div className="flex items-start gap-4">
          <CountdownRing coolingUntil={coolingUntil} createdAt={createdAt} />
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-foreground truncate">{item.title}</p>
            <p className="mt-0.5 text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {fmtRM(item.amountCents, 0)}
            </p>
            {timeCostFormatted && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                ≈ {timeCostFormatted} of your time
              </p>
            )}
            <CountdownText coolingUntil={coolingUntil} createdAt={createdAt} size="lg" />
          </div>
        </div>
      </button>
    )
  }

  return (
    <button onClick={() => onResolve(item.id)} className={cn(CARD_BASE, 'p-4', readyHighlight)}>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex-shrink-0 w-11 h-11 rounded-md flex items-center justify-center',
            isReady ? 'bg-gold text-primary-foreground' : 'bg-primary-tint text-primary',
          )}
        >
          {isReady ? (
            <span className="text-lg">✦</span>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-foreground truncate">{item.title}</p>
          <CountdownText coolingUntil={coolingUntil} createdAt={createdAt} timeCostFormatted={timeCostFormatted} size="sm" />
        </div>

        <span className="flex-shrink-0 text-lg font-bold text-foreground tabular-nums">
          {fmtRM(item.amountCents, 0)}
        </span>
      </div>
    </button>
  )
}
