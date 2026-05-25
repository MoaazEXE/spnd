'use client'

import { useEffect, useState } from 'react'
import { fmtRM } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface Props {
  amountCents: number
  timeCostFormatted?: string
  onDone: () => void
  size?: 'sm' | 'lg'
}

const CONFETTI_COLORS = [
  'var(--primary)',
  'var(--gold)',
  'var(--gold-tint)',
  'var(--primary-soft)',
]

export function CelebrationOverlay({
  amountCents,
  timeCostFormatted,
  onDone,
  size = 'sm',
}: Props) {
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
      role="dialog"
      aria-live="polite"
      onClick={onDone}
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-foreground/55 transition-opacity duration-300',
        visible ? 'opacity-100' : 'opacity-0',
      )}
    >
      {pieces.map(p => (
        <span
          key={p.id}
          aria-hidden="true"
          className="absolute top-0 animate-confetti"
          style={{
            width: 8,
            height: 12,
            background: p.color,
            borderRadius: 2,
            left: p.left,
            animationDelay: p.delay,
            transform: `rotate(${p.rot})`,
          }}
        />
      ))}

      <div
        onClick={e => e.stopPropagation()}
        className={cn(
          'relative z-10 px-8 py-7 text-center bg-card rounded-3xl shadow-pop animate-pop',
          size === 'lg' ? 'w-[460px] max-w-[calc(100vw-40px)]' : 'mx-5',
        )}
      >
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gold-tint flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="text-gold-deep">
            <path d="M12 3l1.8 5.4L19 10.2 13.8 12 12 17.4 10.2 12 5 10.2l5.2-1.8L12 3z" />
          </svg>
        </div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          You didn&apos;t spend
        </p>
        <p className="mb-1 text-4xl font-bold leading-none tracking-tight text-primary tabular-nums">
          {fmtRM(amountCents)}
        </p>
        {timeCostFormatted && (
          <p className="mt-2 text-sm font-medium text-gold-deep">
            That&apos;s {timeCostFormatted} of your life back
          </p>
        )}
        <p className="mt-3 text-sm text-muted-foreground">Nice pause. Money stayed yours.</p>
      </div>
    </div>
  )
}
