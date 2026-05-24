'use client'

import { useEffect, useState } from 'react'
import { fmtRM } from '@/lib/formatters'

interface Props {
  amountCents: number
  timeCostFormatted?: string
  onDone: () => void
  size?: 'sm' | 'lg'
}

const CONFETTI_COLORS = ['#2D5F5B', '#C9A961', '#F4ECD8', '#D1E0DC']

export function CelebrationOverlay({ amountCents, timeCostFormatted, onDone, size = 'sm' }: Props) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 300)
    }, 2400)
    return () => clearTimeout(t)
  }, [onDone])

  const pieceCount = size === 'lg' ? 30 : 18
  const pieces = Array.from({ length: pieceCount }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: `${5 + (i / 17) * 90}%`,
    delay: `${Math.random() * 200}ms`,
    rot: `${Math.random() * 360}deg`,
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
          className="absolute top-0 animate-confetti"
          style={{
            width: 8, height: 12,
            background: p.color,
            borderRadius: 2,
            left: p.left,
            animationDelay: p.delay,
            transform: `rotate(${p.rot})`,
          }}
        />
      ))}

      {/* Card */}
      <div
        className={`relative z-10 bg-card rounded-[28px] px-8 py-7 text-center animate-pop shadow-[0_24px_60px_rgba(31,42,46,0.32)] ${size === 'lg' ? 'w-[460px] max-w-[calc(100vw-40px)]' : 'mx-5'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-16 h-16 rounded-full bg-[var(--gold-tint)] flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#A8893E" aria-hidden="true">
            <path d="M12 3l1.8 5.4L19 10.2 13.8 12 12 17.4 10.2 12 5 10.2l5.2-1.8L12 3z" />
          </svg>
        </div>
        <p className="text-[13px] font-medium uppercase tracking-[0.4px] text-[var(--text-muted)] mb-2">
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
