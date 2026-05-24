'use client'

import { createContext, useCallback, useContext, useState } from 'react'

interface LogModalValue {
  isOpen: boolean
  open: () => void
  close: () => void
}

const LogModalContext = createContext<LogModalValue>({
  isOpen: false,
  open: () => {},
  close: () => {},
})

export function LogModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  return (
    <LogModalContext.Provider value={{ isOpen, open, close }}>
      {children}
    </LogModalContext.Provider>
  )
}

export function useLogModal() {
  return useContext(LogModalContext)
}
