'use client'

import { getCoolingStatus } from '@/core/cooling/coolingState'
import { fmtRM, fmtCountdown } from '@/lib/formatters'
import { useTick } from '@/lib/use-tick'
import { cn } from '@/lib/utils'

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

export function CoolingCard({ item, timeCostFormatted, onResolve, size = 'sm' }: Props) {
  const now = useTick(1000)

  const status = getCoolingStatus({ status: 'COOLING', coolingUntil: item.coolingUntil }, now)
  const isReady = status === 'READY_TO_RESOLVE'
  const remainingMs = Math.max(0, item.coolingUntil.getTime() - now.getTime())
  const totalMs = item.coolingUntil.getTime() - item.createdAt.getTime()
  const progress = totalMs > 0 ? Math.min(100, ((totalMs - remainingMs) / totalMs) * 100) : 100

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
          <CircularCountdown progress={progress} isReady={isReady} />
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
            <p
              className={cn(
                'mt-1.5 text-xs font-medium',
                isReady ? 'text-gold-deep font-semibold' : 'text-muted-foreground',
              )}
            >
              {isReady ? '✦ Ready to decide' : fmtCountdown(remainingMs)}
            </p>
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
          <p
            className={cn(
              'mt-0.5 text-xs font-medium',
              isReady ? 'text-gold-deep font-semibold' : 'text-muted-foreground',
            )}
          >
            {isReady
              ? '✦ Ready to decide'
              : timeCostFormatted
                ? `${fmtCountdown(remainingMs)} · ${timeCostFormatted}`
                : fmtCountdown(remainingMs)}
          </p>
        </div>

        <span className="flex-shrink-0 text-lg font-bold text-foreground tabular-nums">
          {fmtRM(item.amountCents, 0)}
        </span>
      </div>

      <div
        className={cn(
          'mt-3 h-1 rounded-full overflow-hidden',
          isReady ? 'bg-gold/20' : 'bg-primary-tint',
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            isReady ? 'bg-gold' : 'bg-primary',
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </button>
  )
}
