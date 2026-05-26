'use client'

import { usePathname } from 'next/navigation'
import { Plus } from 'lucide-react'
import { useLogModal } from './log-modal-context'

/**
 * Routes where the mobile FAB hurts the UX — either because the page has its
 * own sticky action bar, or because the plus button is irrelevant context.
 */
const HIDDEN_PATTERNS = [
  '/settings',       // no temptation logging context here
  '/profile',        // profile page — no logging context
  '/groups/',        // group detail pages have their own action context
]

function shouldHideFab(pathname: string): boolean {
  // Exact match for /settings and /profile
  if (pathname === '/settings' || pathname === '/profile') return true
  // Group detail pages (e.g. /groups/abc123, /groups/abc123/settle)
  if (/^\/groups\/[^/]+/.test(pathname)) return true
  return false
}

/**
 * Mobile FAB — 64x64 teal circle floating above the bottom tab bar.
 * Hidden on desktop where the top-bar "Log temptation" button takes over.
 * Also hidden on pages where it interferes with the UX.
 */
export function LogFab() {
  const log = useLogModal()
  const pathname = usePathname()

  if (shouldHideFab(pathname)) return null

  return (
    <button
      type="button"
      onClick={log.open}
      aria-label="Log a temptation"
      className="lg:hidden fixed left-1/2 -translate-x-1/2 bottom-[78px] z-30 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-fab transition-transform active:scale-[0.94]"
    >
      <Plus size={26} strokeWidth={2.4} />
    </button>
  )
}
