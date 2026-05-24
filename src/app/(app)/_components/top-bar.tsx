'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, Plus } from 'lucide-react'
import { NotificationBell } from './notification-bell'
import { SearchPalette } from './search-palette'
import { useLogModal } from './log-modal-context'

interface CoolingItem {
  id: string
  title: string
  amountCents: number
  coolingUntil: Date
}

interface Props {
  coolingItems: CoolingItem[]
  userInitial: string
}

export function TopBar({ coolingItems, userInitial }: Props) {
  const [searchOpen, setSearchOpen] = useState(false)
  const log = useLogModal()

  // ⌘K / Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(v => !v)
      }
      if (e.key === 'Escape' && searchOpen) setSearchOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [searchOpen])

  return (
    <>
      <header className="h-16 sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-[var(--sep)] flex items-center px-4 lg:px-6 gap-3">
        {/* Mobile logo — desktop logo lives in sidebar */}
        <Link href="/dashboard" className="lg:hidden flex items-center gap-2 flex-shrink-0">
          <span className="w-8 h-8 rounded-[10px] bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-[14px]">S</span>
          </span>
        </Link>

        {/* Search — desktop full, mobile icon */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden lg:flex flex-1 max-w-[520px] mx-auto h-10 px-4 rounded-[12px] bg-card border border-[var(--sep)] items-center gap-3 text-left text-[var(--text-subtle)] hover:border-[var(--sep-strong)] transition-colors"
          aria-label="Search"
        >
          <Search size={16} strokeWidth={1.8} />
          <span className="flex-1 text-[14px]">Search items, groups, or members</span>
        </button>

        {/* Spacer for mobile */}
        <div className="lg:hidden flex-1" />

        {/* Mobile search icon */}
        <button
          onClick={() => setSearchOpen(true)}
          className="lg:hidden w-10 h-10 rounded-[12px] flex items-center justify-center hover:bg-[rgba(31,42,46,0.05)] transition-colors"
          aria-label="Search"
        >
          <Search size={18} strokeWidth={1.8} className="text-[var(--text-muted)]" />
        </button>

        {/* Notification bell */}
        <NotificationBell items={coolingItems} />

        {/* Log temptation — desktop full button, mobile icon */}
        <button
          onClick={log.open}
          className="hidden lg:inline-flex h-10 items-center gap-2 px-4 rounded-[12px] bg-primary text-primary-foreground text-[14px] font-semibold hover:bg-[var(--primary-deep)] transition-colors active:scale-[0.97]"
        >
          <Plus size={16} strokeWidth={2.2} />
          Log temptation
        </button>
        <button
          onClick={log.open}
          className="lg:hidden w-10 h-10 rounded-[12px] bg-primary text-primary-foreground flex items-center justify-center hover:bg-[var(--primary-deep)] transition-colors"
          aria-label="Log a temptation"
        >
          <Plus size={18} strokeWidth={2.2} />
        </button>

        {/* Mobile user avatar */}
        <div className="lg:hidden w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[13px] font-semibold flex-shrink-0">
          {userInitial}
        </div>
      </header>

      <SearchPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
