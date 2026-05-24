'use client'

import { LogSheet } from '@/app/(app)/dashboard/_components/log-sheet'
import { useLogModal } from './log-modal-context'
import type { TimeCostInput } from '@/types'

interface Props {
  defaultCoolingPeriod: string
  timeCostContext: Omit<TimeCostInput, 'amountCents'> | null
}

export function LogSheetMount({ defaultCoolingPeriod, timeCostContext }: Props) {
  const { isOpen, close } = useLogModal()
  if (!isOpen) return null
  return (
    <LogSheet
      onClose={close}
      defaultCoolingPeriod={defaultCoolingPeriod}
      timeCostContext={timeCostContext}
    />
  )
}
