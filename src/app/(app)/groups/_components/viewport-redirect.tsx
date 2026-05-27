'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  /** Where to send desktop visitors. */
  desktop?: string
  /** Where to send mobile visitors. */
  mobile?: string
}

/**
 * Renders nothing — just checks viewport on mount and `router.replace`s if the
 * current viewport doesn't match the layout this page renders. Use it on
 * mobile-only pages (e.g. /groups/[id]) to bounce desktop users into the
 * two-pane shell, and vice versa, so navigation never drops anyone into the
 * "wrong" layout for their device.
 */
export function ViewportRedirect({ desktop, mobile }: Props) {
  const router = useRouter()
  useEffect(() => {
    if (typeof window === 'undefined') return
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches
    if (isDesktop && desktop) {
      router.replace(desktop)
    } else if (!isDesktop && mobile) {
      router.replace(mobile)
    }
  }, [router, desktop, mobile])
  return null
}
