'use client'

import { useCallback, useEffect, useState } from 'react'
import { ResolveSheet } from '@/app/(app)/dashboard/_components/resolve-sheet'
import { CelebrationOverlay } from '@/app/(app)/dashboard/_components/celebration-overlay'
import { useResolveSheet } from './resolve-sheet-context'
import { timeCostForItem } from '@/lib/timeCostForItem'
import type { TimeCostInput } from '@/types'

interface CoolingItem {
  id: string
  title: string
  amountCents: number
  coolingUntil: Date
  createdAt: Date
  category: string | null
}

interface Celebration {
  amountCents: number
  timeCostFormatted?: string
}

interface Props {
  coolingItems: CoolingItem[]
  timeCostContext: Omit<TimeCostInput, 'amountCents'> | null
}

export function ResolveSheetMount({ coolingItems, timeCostContext }: Props) {
  const { itemId, close } = useResolveSheet()
  const [celebration, setCelebration] = useState<Celebration | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setIsDesktop(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const handleSkipped = useCallback((amountCents: number, timeCostFormatted?: string) => {
    setCelebration({ amountCents, timeCostFormatted })
  }, [])

  const item = coolingItems.find(i => i.id === itemId) ?? null

  return (
    <>
      {item && (
        <ResolveSheet
          item={{
            ...item,
            timeCostFormatted: timeCostForItem(timeCostContext, item.amountCents),
          }}
          onClose={close}
          onSkipped={handleSkipped}
        />
      )}
      {celebration && (
        <CelebrationOverlay
          amountCents={celebration.amountCents}
          timeCostFormatted={celebration.timeCostFormatted}
          onDone={() => setCelebration(null)}
          size={isDesktop ? 'lg' : 'sm'}
        />
      )}
    </>
  )
}
