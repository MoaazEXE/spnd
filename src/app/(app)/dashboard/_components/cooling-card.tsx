'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
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
}

export function CoolingCard({ item, timeCostFormatted, onResolve }: Props) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  const status = getCoolingStatus({ status: 'COOLING', coolingUntil: item.coolingUntil }, now)
  const isReady = status === 'READY_TO_RESOLVE'
  const remainingMs = Math.max(0, item.coolingUntil.getTime() - now.getTime())
  const totalMs = item.coolingUntil.getTime() - item.createdAt.getTime()
  const progress = totalMs > 0 ? Math.min(100, ((totalMs - remainingMs) / totalMs) * 100) : 100

  return (
    <button
      onClick={() => onResolve(item.id)}
      className={[
        'w-full text-left rounded-[20px] p-4 bg-card transition-all',
        'shadow-[0_1px_2px_rgba(31,42,46,0.04),0_4px_16px_rgba(31,42,46,0.04)]',
        'hover:shadow-[0_1px_2px_rgba(31,42,46,0.04),0_8px_24px_rgba(31,42,46,0.06)]',
        isReady ? 'border border-[#C9A961]' : 'border border-transparent',
      ].join(' ')}
    >
      <div className="flex items-center gap-3">
        {/* Icon container */}
        <div className={[
          'w-11 h-11 rounded-[12px] flex items-center justify-center flex-shrink-0',
          isReady ? 'bg-[#F4ECD8]' : 'bg-secondary',
        ].join(' ')}>
          {isReady
            ? <span className="text-[#C9A961] text-lg">✦</span>
            : <Clock size={18} strokeWidth={1.8} className="text-primary" />
          }
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-foreground truncate">{item.title}</p>
          <p className={[
            'text-[13px] font-medium mt-0.5',
            isReady ? 'text-[#A8893E]' : 'text-muted-foreground',
          ].join(' ')}>
            {isReady ? '✦ Ready to decide' : fmtCountdown(remainingMs)}
          </p>
          {timeCostFormatted && (
            <p className="text-[12px] text-muted-foreground/70 mt-0.5">≈ {timeCostFormatted}</p>
          )}
        </div>

        {/* Amount */}
        <span className="text-[17px] font-bold tabular-nums text-foreground flex-shrink-0">
          {fmtRM(item.amountCents, 0)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1 rounded-full overflow-hidden bg-secondary">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isReady ? 'bg-[#C9A961]' : 'bg-primary'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </button>
  )
}
