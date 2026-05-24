'use client'

import { useEffect, useState } from 'react'
import { CoolingCard } from '@/app/(app)/dashboard/_components/cooling-card'
import { useResolveSheet } from '@/app/(app)/_components/resolve-sheet-context'
import { timeCostForItem } from '@/lib/timeCostForItem'
import type { TimeCostInput } from '@/types'

interface CoolingItem {
  id: string
  title: string
  amountCents: number
  coolingUntil: Date
  createdAt: Date
}

interface Props {
  items: CoolingItem[]
  timeCostContext: Omit<TimeCostInput, 'amountCents'> | null
}

export function CoolingGrid({ items, timeCostContext }: Props) {
  const resolveSheet = useResolveSheet()
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setIsDesktop(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  if (items.length === 0) {
    return (
      <div className="rounded-[20px] bg-card py-12 px-5 text-center shadow-[0_1px_2px_rgba(31,42,46,0.04),0_4px_16px_rgba(31,42,46,0.04)]">
        <p className="text-[15px] font-semibold text-foreground">Nothing cooling.</p>
        <p className="text-[13px] text-[var(--text-muted)] mt-1">Use the top bar to log a temptation.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map(item => (
        <CoolingCard
          key={item.id}
          item={item}
          timeCostFormatted={timeCostForItem(timeCostContext, item.amountCents)}
          onResolve={id => resolveSheet.open(id)}
          size={isDesktop ? 'lg' : 'sm'}
        />
      ))}
    </div>
  )
}
