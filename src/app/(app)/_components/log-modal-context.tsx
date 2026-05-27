'use client'

import { createContext, useCallback, useContext, useState } from 'react'

export interface OptimisticCoolingItem {
  id: string
  title: string
  amountCents: number
  coolingUntil: Date
  createdAt: Date
}

interface LogModalValue {
  isOpen: boolean
  open: () => void
  close: () => void
  optimisticItems: OptimisticCoolingItem[]
  addOptimistic: (item: OptimisticCoolingItem) => void
  clearOptimistic: () => void
}

const LogModalContext = createContext<LogModalValue>({
  isOpen: false,
  open: () => {},
  close: () => {},
  optimisticItems: [],
  addOptimistic: () => {},
  clearOptimistic: () => {},
})

export function LogModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [optimisticItems, setOptimisticItems] = useState<OptimisticCoolingItem[]>([])
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const addOptimistic = useCallback((item: OptimisticCoolingItem) => {
    setOptimisticItems(prev => [item, ...prev])
  }, [])
  const clearOptimistic = useCallback(() => setOptimisticItems([]), [])
  return (
    <LogModalContext.Provider value={{ isOpen, open, close, optimisticItems, addOptimistic, clearOptimistic }}>
      {children}
    </LogModalContext.Provider>
  )
}

export function useLogModal() {
  return useContext(LogModalContext)
}
