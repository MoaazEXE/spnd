'use client'

import { useState } from 'react'
import type { DailySavingsPoint } from '@/core/savings/savings'
import { computeSavingsStreak, bestDailySavings } from '@/core/savings/savings'
import { Card } from '@/components/ui/card'
import { fmtCurrency } from '@/lib/formatters'
import { useCurrency } from '@/lib/currency-context'

interface Props {
  data: DailySavingsPoint[]
}

function fmtBarDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })
}

export function DailySavesCard({ data }: Props) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const currency = useCurrency()

  const max = Math.max(...data.map(d => d.cents), 1)
  const streak = computeSavingsStreak(data)
  const best = bestDailySavings(data)
  const total = data.reduce((s, d) => s + d.cents, 0)
  const allZero = total === 0

  const w = 320
  const h = 96
  const padX = 4
  const padY = 6
  const n = data.length
  const gap = 1.6
  const barWidth = (w - padX * 2 - gap * (n - 1)) / n

  const hover = hoverIdx !== null ? data[hoverIdx] : null

  return (
    <Card>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Daily saves
          </p>
          <p className="mt-0.5 text-[11px] text-subtle-foreground">Last 30 days</p>
        </div>
        {streak > 0 && (
          <span className="inline-flex items-center gap-1 whitespace-nowrap px-2.5 py-1 rounded-full bg-gold-tint text-gold-deep text-xs font-semibold">
            <span aria-hidden="true">🔥</span> {streak}-day streak
          </span>
        )}
      </div>

      {allZero ? (
        <div className="h-24 flex items-center justify-center rounded-lg bg-primary-tint/40">
          <p className="px-4 text-center text-xs text-subtle-foreground">
            No saves yet — log a temptation and skip it to start a streak.
          </p>
        </div>
      ) : (
        <div className="relative">
          <svg
            width="100%"
            height={h}
            viewBox={`0 0 ${w} ${h}`}
            preserveAspectRatio="none"
            onMouseLeave={() => setHoverIdx(null)}
            className="overflow-visible"
          >
            <defs>
              <linearGradient id="dailyBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.95" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.55" />
              </linearGradient>
              <linearGradient id="dailyBarHover" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--gold)" stopOpacity="1" />
                <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.7" />
              </linearGradient>
            </defs>

            {data.map((d, i) => {
              const x = padX + i * (barWidth + gap)
              const barH =
                d.cents > 0 ? Math.max(2, (d.cents / max) * (h - padY * 2)) : 2
              const y = h - padY - barH
              const isHover = hoverIdx === i
              const isEmpty = d.cents === 0
              return (
                <g key={d.date}>
                  <rect
                    x={x - gap / 2}
                    y={0}
                    width={barWidth + gap}
                    height={h}
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoverIdx(i)}
                  />
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barH}
                    rx="1.5"
                    fill={
                      isEmpty
                        ? 'color-mix(in oklab, var(--foreground) 8%, transparent)'
                        : isHover
                          ? 'url(#dailyBarHover)'
                          : 'url(#dailyBar)'
                    }
                    className="animate-bar-grow"
                    style={{
                      animationDelay: `${i * 18}ms`,
                      transition: 'fill 150ms ease-out',
                      pointerEvents: 'none',
                    }}
                  />
                </g>
              )
            })}
          </svg>

          {hover && hoverIdx !== null && (
            <div
              className="absolute z-10 -top-2 -translate-x-1/2 -translate-y-full px-2.5 py-1.5 rounded-md bg-primary-deep text-primary-foreground text-[11px] font-semibold whitespace-nowrap shadow-tooltip pointer-events-none"
              style={{
                left: `${((padX + hoverIdx * (barWidth + gap) + barWidth / 2) / w) * 100}%`,
              }}
            >
              <div className="text-[10px] uppercase tracking-wide text-primary-foreground/70">
                {fmtBarDate(hover.date)}
              </div>
              <div className="text-xs text-gold-tint tabular-nums">
                {hover.cents > 0
                  ? fmtCurrency(hover.cents, currency)
                  : 'No saves'}
              </div>
            </div>
          )}
        </div>
      )}

      {!allZero && (
        <div className="mt-3 flex items-center justify-between text-xs">
          {best && (
            <span className="text-muted-foreground">
              Best day:{' '}
              <span className="font-semibold text-foreground tabular-nums">
                {fmtCurrency(best.cents, currency, 0)}
              </span>
            </span>
          )}
          <span className="text-muted-foreground">
            30-day total:{' '}
            <span className="font-semibold text-primary tabular-nums">{fmtCurrency(total, currency, 0)}</span>
          </span>
        </div>
      )}
    </Card>
  )
}
