'use client'

import { useEffect, useState } from 'react'
import { fmtRM } from '@/lib/formatters'

interface Props {
  amountCents: number
  timeCostFormatted?: string
  onDone: () => void
}

const CONFETTI_COLORS = ['#2D5F5B', '#C9A961', '#F4ECD8', '#D1E0DC']

export function CelebrationOverlay({ amountCents, timeCostFormatted, onDone }: Props) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 300) // wait for fade-out
    }, 2400)
    return () => clearTimeout(t)
  }, [onDone])

  const pieces = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: `${5 + (i / 17) * 90}%`,
    delay: `${(i / 17) * 200}ms`,
  }))

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'rgba(31,42,46,0.55)' }}
      onClick={onDone}
    >
      {/* Confetti */}
      {pieces.map(p => (
        <span
          key={p.id}
          className="absolute top-0 w-2 h-2 rounded-sm animate-confetti"
          style={{
            background: p.color,
            left: p.left,
            animationDelay: p.delay,
          }}
        />
      ))}

      {/* Card */}
      <div
        className="relative z-10 bg-card rounded-[28px] px-8 py-7 text-center mx-5 animate-pop shadow-[0_24px_60px_rgba(31,42,46,0.32)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-full bg-[#F4ECD8] flex items-center justify-center mx-auto mb-4 text-2xl">
          ✦
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[1.2px] text-muted-foreground mb-2">
          You didn&apos;t spend
        </p>
        <p className="text-[38px] font-bold leading-none tracking-tight text-primary tabular-nums mb-1">
          {fmtRM(amountCents)}
        </p>
        {timeCostFormatted && (
          <p className="text-[14px] font-medium text-[#A8893E] mt-2">
            That&apos;s {timeCostFormatted} of your life back
          </p>
        )}
        <p className="text-[14px] text-muted-foreground mt-3">Nice pause. Money stayed yours.</p>
      </div>
    </div>
  )
}
