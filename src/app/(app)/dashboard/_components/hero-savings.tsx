'use client'

import { useEffect, useRef } from 'react'
import { fmtRM } from '@/lib/formatters'

interface Props {
  savedCents: number
  timeCostFormatted?: string
}

export function HeroSavings({ savedCents, timeCostFormatted }: Props) {
  const displayRef = useRef<HTMLSpanElement>(null)
  const prevRef = useRef(savedCents)

  // Tween the number when savedCents changes (700ms cubic ease-out per spec)
  useEffect(() => {
    const el = displayRef.current
    if (!el || prevRef.current === savedCents) return

    const from = prevRef.current
    const to = savedCents
    const duration = 700
    const start = performance.now()

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3) // cubic ease-out
      const current = Math.round(from + (to - from) * eased)
      el.textContent = fmtRM(current)
      if (t < 1) requestAnimationFrame(tick)
      else prevRef.current = to
    }

    requestAnimationFrame(tick)
  }, [savedCents])

  return (
    <section className="px-5 pt-8 pb-6 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[1.2px] text-primary/70 mb-2">
        Saved by waiting
      </p>
      <span
        ref={displayRef}
        className="block text-[56px] font-bold leading-none tracking-[-2.2px] text-primary tabular-nums"
      >
        {fmtRM(savedCents)}
      </span>

      {timeCostFormatted && (
        <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-[#F4ECD8] text-[#A8893E] text-[13px] font-semibold">
          <span>✦</span>
          <span>{timeCostFormatted} of your life</span>
        </div>
      )}
    </section>
  )
}
