'use client'

import { createContext, useCallback, useContext, useState } from 'react'

interface ResolveSheetValue {
  itemId: string | null
  open: (id: string) => void
  close: () => void
  resolvedIds: ReadonlySet<string>
  markResolved: (id: string) => void
}

const Ctx = createContext<ResolveSheetValue>({
  itemId: null,
  open: () => {},
  close: () => {},
  resolvedIds: new Set(),
  markResolved: () => {},
})

export function ResolveSheetProvider({ children }: { children: React.ReactNode }) {
  const [itemId, setItemId] = useState<string | null>(null)
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set())
  const open = useCallback((id: string) => setItemId(id), [])
  const close = useCallback(() => setItemId(null), [])
  const markResolved = useCallback((id: string) => {
    setResolvedIds(prev => new Set([...prev, id]))
  }, [])
  return <Ctx.Provider value={{ itemId, open, close, resolvedIds, markResolved }}>{children}</Ctx.Provider>
}

export function useResolveSheet() {
  return useContext(Ctx)
}
