'use client'

import { createContext, useCallback, useContext, useState } from 'react'

interface ResolveSheetValue {
  itemId: string | null
  open: (id: string) => void
  close: () => void
}

const Ctx = createContext<ResolveSheetValue>({
  itemId: null,
  open: () => {},
  close: () => {},
})

export function ResolveSheetProvider({ children }: { children: React.ReactNode }) {
  const [itemId, setItemId] = useState<string | null>(null)
  const open  = useCallback((id: string) => setItemId(id), [])
  const close = useCallback(() => setItemId(null), [])
  return <Ctx.Provider value={{ itemId, open, close }}>{children}</Ctx.Provider>
}

export function useResolveSheet() {
  return useContext(Ctx)
}
