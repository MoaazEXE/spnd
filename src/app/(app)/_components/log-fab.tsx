'use client'

import { Plus } from 'lucide-react'
import { useLogModal } from './log-modal-context'

/**
 * Mobile FAB — 64x64 teal circle floating above the bottom tab bar.
 * Hidden on desktop where the top-bar "Log temptation" button takes over.
 */
export function LogFab() {
  const log = useLogModal()
  return (
    <button
      type="button"
      onClick={log.open}
      aria-label="Log a temptation"
      className="lg:hidden fixed left-1/2 -translate-x-1/2 bottom-[78px] z-30 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_6px_20px_rgba(45,95,91,0.32)] transition-transform active:scale-[0.94]"
    >
      <Plus size={26} strokeWidth={2.4} />
    </button>
  )
}
