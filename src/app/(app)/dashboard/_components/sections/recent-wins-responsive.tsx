'use client'

import { useIsDesktop } from '@/lib/use-is-desktop'
import { RecentWins } from '../recent-wins'

interface WinItem {
  id: string
  title: string
  amountCents: number
  resolvedAt: Date | null
  status: 'SKIPPED' | 'BOUGHT'
}

interface Props {
  skippedItems: WinItem[]
  boughtItems: WinItem[]
}

export function RecentWinsResponsive({ skippedItems, boughtItems }: Props) {
  const isDesktop = useIsDesktop()
  return (
    <RecentWins
      skippedItems={skippedItems}
      boughtItems={boughtItems}
      maxItems={isDesktop ? 5 : 3}
    />
  )
}
