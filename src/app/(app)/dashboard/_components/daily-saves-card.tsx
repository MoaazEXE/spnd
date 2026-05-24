'use client'

import { useState } from 'react'
import type { DailySavingsPoint } from '@/core/savings/savings'
import { computeSavingsStreak, bestDailySavings } from '@/core/savings/savings'

interface Props {
  data: DailySavingsPoint[]
}

function fmtBarDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })
}

function fmtRMShort(cents: number): string {
  return `RM ${(cents / 100).toLocaleString('en-MY', { maximumFractionDigits: 0 })}`
}

export function DailySavesCard({ data }: Props) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  const max = Math.max(...data.map(d => d.cents), 1)
  const streak = computeSavingsStreak(data)
  const best = bestDailySavings(data)
  const total = data.reduce((s, d) => s + d.cents, 0)
  const allZero = total === 0

  // SVG geometry (viewBox is responsive)
  const w = 320, h = 96, padX = 4, padY = 6
  const n = data.length
  const gap = 1.6
  const barWidth = (w - padX * 2 - gap * (n - 1)) / n

  const hover = hoverIdx !== null ? data[hoverIdx] : null

  return (
    <div className="rounded-[20px] bg-card px-5 py-5 shadow-[0_1px_2px_rgba(31,42,46,0.04),0_4px_16px_rgba(31,42,46,0.04)]">
      {/* Header */}
      <div className="flex items-start justify-between mb-3 gap-3">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.2px] text-[var(--text-muted)]">
            Daily saves
          </p>
          <p className="text-[11px] text-[var(--text-subtle)] mt-0.5">Last 30 days</p>
        </div>
        {streak > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--gold-tint)] text-[var(--gold-deep)] text-[12px] font-semibold whitespace-nowrap">
            <span aria-hidden="true">🔥</span> {streak}-day streak
          </span>
        )}
      </div>

      {/* Bars */}
      {allZero ? (
        <div className="h-[96px] flex items-center justify-center rounded-[14px] bg-[var(--primary-tint)]/40">
          <p className="text-[12px] text-[var(--text-subtle)] text-center px-4">
            No saves yet — log a temptation and skip it to start a streak.
          </p>
        </div>
      ) : (
        <div className="relative">
          <svg
            width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none"
            onMouseLeave={() => setHoverIdx(null)}
            className="overflow-visible"
          >
            <defs>
              <linearGradient id="dailyBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#2D5F5B" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#2D5F5B" stopOpacity="0.55" />
              </linearGradient>
              <linearGradient id="dailyBarHover" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#C9A961" stopOpacity="1" />
                <stop offset="100%" stopColor="#C9A961" stopOpacity="0.7" />
              </linearGradient>
            </defs>

            {data.map((d, i) => {
              const x = padX + i * (barWidth + gap)
              const barH = d.cents > 0
                ? Math.max(2, (d.cents / max) * (h - padY * 2))
                : 2
              const y = h - padY - barH
              const isHover = hoverIdx === i
              const isEmpty = d.cents === 0
              return (
                <g key={d.date}>
                  {/* Wide invisible hover target — entire column */}
                  <rect
                    x={x - gap / 2} y={0}
                    width={barWidth + gap} height={h}
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoverIdx(i)}
                  />
                  <rect
                    x={x} y={y}
                    width={barWidth} height={barH}
                    rx="1.5"
                    fill={isEmpty ? 'rgba(31,42,46,0.08)' : (isHover ? 'url(#dailyBarHover)' : 'url(#dailyBar)')}
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

          {/* Tooltip */}
          {hover && hoverIdx !== null && (
            <div
              className="absolute pointer-events-none -translate-x-1/2 -top-2 -translate-y-full px-2.5 py-1.5 rounded-[8px] bg-[var(--primary-deep)] text-white text-[11px] font-semibold whitespace-nowrap shadow-[0_4px_12px_rgba(31,42,46,0.25)] z-10"
              style={{ left: `${((padX + hoverIdx * (barWidth + gap) + barWidth / 2) / w) * 100}%` }}
            >
              <div className="text-[10px] uppercase tracking-[0.4px] text-white/70">{fmtBarDate(hover.date)}</div>
              <div className="text-[12px] text-[var(--gold-tint)] tabular-nums">
                {hover.cents > 0
                  ? `RM ${(hover.cents / 100).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : 'No saves'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer stats */}
      {!allZero && (
        <div className="flex items-center justify-between mt-3 text-[12px]">
          {best && (
            <span className="text-[var(--text-muted)]">
              Best day: <span className="font-semibold text-foreground tabular-nums">{fmtRMShort(best.cents)}</span>
            </span>
          )}
          <span className="text-[var(--text-muted)]">
            30-day total: <span className="font-semibold text-primary tabular-nums">{fmtRMShort(total)}</span>
          </span>
        </div>
      )}
    </div>
  )
}
