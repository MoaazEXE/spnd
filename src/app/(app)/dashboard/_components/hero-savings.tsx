'use client'

import { useEffect, useRef, useState } from 'react'
import type { SavingsDataPoint } from '@/core/savings/savings'

interface Props {
  savedCents: number
  thisMonthCents: number
  timeCostFormatted?: string
  sparkData: SavingsDataPoint[]  // 30-day array; mobile slices last 7
}

function Sparkline({ data, gradientId }: { data: SavingsDataPoint[]; gradientId: string }) {
  const w = 320, h = 88, pad = 6
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  const values = data.map(d => d.cumulativeCents)
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = max - min || 1
  const n = values.length

  const pts = values.map((v, i) => ({
    x: n > 1 ? pad + (i / (n - 1)) * (w - pad * 2) : w / 2,
    y: h - pad - ((v - min) / range) * (h - pad * 2),
  }))

  // Monotone-safe line: use small tension so curves don't overshoot.
  // Each segment uses control points 1/3 of the way from each endpoint.
  function buildPath(close: boolean) {
    if (pts.length === 0) return ''
    if (pts.length === 1) {
      const p = pts[0]
      return close
        ? `M${p.x},${p.y} L${p.x},${h} Z`
        : `M${p.x},${p.y}`
    }
    let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i], p1 = pts[i + 1]
      const dx = (p1.x - p0.x) / 3
      d += ` C${(p0.x + dx).toFixed(1)},${p0.y.toFixed(1)} ${(p1.x - dx).toFixed(1)},${p1.y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`
    }
    if (close) {
      d += ` L${pts[pts.length - 1].x.toFixed(1)},${h} L${pts[0].x.toFixed(1)},${h} Z`
    }
    return d
  }

  const line = buildPath(false)
  const area = buildPath(true)
  const last = pts[pts.length - 1]
  const hover = hoverIdx !== null ? pts[hoverIdx] : null
  const hoverData = hoverIdx !== null ? data[hoverIdx] : null

  function getNearestIdx(clientX: number): number {
    const svg = svgRef.current
    if (!svg) return 0
    const rect = svg.getBoundingClientRect()
    const xRatio = (clientX - rect.left) / rect.width
    const xInViewBox = xRatio * w
    let nearest = 0, bestDist = Infinity
    pts.forEach((p, i) => {
      const dist = Math.abs(p.x - xInViewBox)
      if (dist < bestDist) { bestDist = dist; nearest = i }
    })
    return nearest
  }

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    setHoverIdx(getNearestIdx(e.clientX))
  }

  function handleTouchMove(e: React.TouchEvent<SVGSVGElement>) {
    e.preventDefault()
    const touch = e.touches[0]
    if (touch) setHoverIdx(getNearestIdx(touch.clientX))
  }

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })
  }

  // Clamp tooltip left% so it doesn't clip at edges
  const tooltipLeft = hover ? Math.min(Math.max((hover.x / w) * 100, 8), 92) : 50

  return (
    <div className="relative select-none">
      <svg
        ref={svgRef}
        width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
        onTouchStart={e => { const t = e.touches[0]; if (t) setHoverIdx(getNearestIdx(t.clientX)) }}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setHoverIdx(null)}
        className="cursor-crosshair overflow-visible touch-none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2D5F5B" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#2D5F5B" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path d={area} fill={`url(#${gradientId})`} className="animate-fade-area" />

        {/* Crosshair */}
        {hover && (
          <line
            x1={hover.x} y1={pad} x2={hover.x} y2={h - pad}
            stroke="#2D5F5B" strokeWidth="1" strokeDasharray="2 3" opacity="0.35"
          />
        )}

        {/* Line */}
        <path
          d={line}
          fill="none"
          stroke="#2D5F5B"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="animate-fade-in"
        />

        {/* Latest dot */}
        {!hover && (
          <>
            <circle cx={last.x} cy={last.y} r="8" fill="#2D5F5B" className="animate-pulse-soft" />
            <circle cx={last.x} cy={last.y} r="4" fill="#2D5F5B" />
          </>
        )}

        {/* Hover dot */}
        {hover && (
          <>
            <circle cx={hover.x} cy={hover.y} r="9" fill="#2D5F5B" opacity="0.22" />
            <circle cx={hover.x} cy={hover.y} r="4.5" fill="#2D5F5B" />
            <circle cx={hover.x} cy={hover.y} r="2" fill="#fff" />
          </>
        )}
      </svg>

      {/* Tooltip */}
      {hoverData && hover && (
        <div
          className="absolute pointer-events-none -translate-x-1/2 -top-2 -translate-y-full px-2.5 py-1.5 rounded-[8px] bg-[var(--primary-deep)] text-white text-[11px] font-semibold whitespace-nowrap shadow-[0_4px_12px_rgba(31,42,46,0.25)] z-10"
          style={{ left: `${tooltipLeft}%` }}
        >
          <div className="text-[10px] uppercase tracking-[0.4px] text-white/70">{fmtDate(hoverData.date)}</div>
          <div className="text-[12px] text-[var(--gold-tint)] tabular-nums">
            RM {(hoverData.cumulativeCents / 100).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      )}
    </div>
  )
}

export function HeroSavings({ savedCents, thisMonthCents, timeCostFormatted, sparkData }: Props) {
  const displayRef = useRef<HTMLSpanElement>(null)
  const prevRef = useRef(savedCents)

  useEffect(() => {
    const el = displayRef.current
    if (!el || prevRef.current === savedCents) return
    const from = prevRef.current
    const to = savedCents
    const duration = 700
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      const current = Math.round(from + (to - from) * eased)
      el.textContent = new Intl.NumberFormat('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(current / 100)
      if (t < 1) requestAnimationFrame(tick)
      else { prevRef.current = to; el.textContent = new Intl.NumberFormat('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(to / 100) }
    }
    requestAnimationFrame(tick)
  }, [savedCents])

  const initialNumber = new Intl.NumberFormat('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(savedCents / 100)
  const mobileData = sparkData.slice(-7)
  const allZeroMobile = mobileData.every(d => d.cumulativeCents === 0)
  const allZeroDesktop = sparkData.every(d => d.cumulativeCents === 0)

  return (
    <section className="rounded-[20px] bg-card px-5 py-5 lg:px-6 lg:py-6 shadow-[0_1px_2px_rgba(31,42,46,0.04),0_4px_16px_rgba(31,42,46,0.04)]">
      {/* Label */}
      <p className="text-[11px] font-semibold uppercase tracking-[0.4px] text-[var(--text-muted)] mb-2">
        Saved by waiting · all time
      </p>

      {/* Hero number */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-[24px] lg:text-[28px] font-semibold leading-none tracking-[-0.6px] text-primary tabular-nums">
          RM
        </span>
        <span
          ref={displayRef}
          className="text-[44px] lg:text-[56px] font-bold leading-none tracking-[-1.8px] lg:tracking-[-2.4px] text-primary tabular-nums"
          style={{ fontFamily: 'var(--font-fraunces, inherit)' }}
        >
          {initialNumber}
        </span>
      </div>

      {/* Chip row — time-cost + this-month side by side */}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        {timeCostFormatted && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--primary-tint)] text-[var(--primary-deep)] text-[12px] font-semibold">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#1F4744" aria-hidden="true">
              <path d="M12 3l1.8 5.4L19 10.2 13.8 12 12 17.4 10.2 12 5 10.2l5.2-1.8L12 3z" />
            </svg>
            +{timeCostFormatted} of your life
          </div>
        )}
        {thisMonthCents > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--gold-tint)] text-[var(--gold-deep)] text-[12px] font-semibold">
            +RM {(thisMonthCents / 100).toLocaleString('en-MY', { maximumFractionDigits: 0 })} this month
          </div>
        )}
      </div>

      {/* Mobile sparkline — 7 days */}
      <div className="lg:hidden mt-5">
        {allZeroMobile ? (
          <div className="h-[80px] flex items-center justify-center rounded-[14px] bg-[var(--primary-tint)]/40">
            <p className="text-[12px] text-[var(--text-subtle)]">Your savings will appear here</p>
          </div>
        ) : (
          <Sparkline data={mobileData} gradientId="sparkGrad7" />
        )}
        <div className="flex justify-between mt-2 text-[11px] font-medium text-[var(--text-subtle)]">
          <span>7 days ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* Desktop sparkline — 30 days */}
      <div className="hidden lg:block mt-5">
        {allZeroDesktop ? (
          <div className="h-[80px] flex items-center justify-center rounded-[14px] bg-[var(--primary-tint)]/40">
            <p className="text-[12px] text-[var(--text-subtle)]">Your savings will appear here</p>
          </div>
        ) : (
          <Sparkline data={sparkData} gradientId="sparkGrad30" />
        )}
        <div className="flex justify-between mt-2 text-[11px] font-medium text-[var(--text-subtle)]">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </div>
    </section>
  )
}
