'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Clock, Users, Wallet, LogOut } from 'lucide-react'
import { signOut } from '@/app/actions/auth'
import { fmtRM } from '@/lib/formatters'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home',     icon: Home     },
  { href: '/cooling',   label: 'Cooling',  icon: Clock    },
  { href: '/groups',    label: 'Groups',   icon: Users    },
  { href: '/settings',  label: 'Income',   icon: Wallet   },
]

interface Props {
  name: string
  email: string
  initial: string
  savedCents: number
  coolingCount: number
  groupsCount: number
}

export function Nav({ name, email, initial, savedCents, coolingCount, groupsCount }: Props) {
  const pathname = usePathname()

  function isActive(href: string) {
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
  }

  function badgeCount(href: string) {
    if (href === '/cooling') return coolingCount
    if (href === '/groups')  return groupsCount
    return 0
  }

  return (
    <>
      {/* ── Left sidebar ── desktop only */}
      <aside className="hidden lg:flex w-[240px] shrink-0 h-screen sticky top-0 border-r border-[var(--sep)] bg-[var(--bg-deep)] flex-col px-4 pt-6 pb-5">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 px-2 pb-5 hover:opacity-80 transition-opacity">
          <span className="w-8 h-8 rounded-[10px] bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-base">S</span>
          </span>
          <span className="text-[22px] font-semibold tracking-[-0.6px] text-foreground">Settle</span>
        </Link>

        {/* Saved-by-waiting mini-stat — matches design screenshot */}
        <div className="px-4 py-3.5 bg-card rounded-[14px] mb-5 shadow-[0_1px_2px_rgba(31,42,46,0.04),0_4px_16px_rgba(31,42,46,0.04)]">
          <p className="text-[10px] font-semibold uppercase tracking-[1px] text-[var(--text-muted)]">Saved by waiting</p>
          <p className="text-[22px] font-semibold text-primary tracking-[-0.6px] tabular-nums mt-1" style={{ fontFamily: 'var(--font-fraunces, inherit)' }}>
            {fmtRM(savedCents)}
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-0.5 flex-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            const count = badgeCount(href)
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'h-[42px] px-3.5 rounded-[10px] flex items-center gap-3 text-[14px] font-medium transition-colors',
                  active
                    ? 'bg-card text-[var(--primary-deep)] shadow-[inset_0_0_0_1px_rgba(31,42,46,0.08),0_1px_2px_rgba(31,42,46,0.04)]'
                    : 'text-[var(--text-muted)] hover:bg-[rgba(31,42,46,0.04)] hover:text-foreground',
                ].join(' ')}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span className="flex-1">{label}</span>
                {count > 0 && (
                  <span className={[
                    'h-5 min-w-5 px-1.5 rounded-full text-[11px] font-semibold inline-flex items-center justify-center tabular-nums',
                    active
                      ? 'bg-[var(--primary-tint)] text-[var(--primary-deep)]'
                      : 'bg-[rgba(31,42,46,0.06)] text-[var(--text-muted)]',
                  ].join(' ')}>
                    {count}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Account chip */}
        <div className="px-3 py-2.5 rounded-[12px] bg-card flex items-center gap-2.5 shadow-[0_1px_2px_rgba(31,42,46,0.04),0_4px_16px_rgba(31,42,46,0.04)]">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[13px] font-semibold flex-shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold truncate">{name}</p>
            <p className="text-[11px] text-[var(--text-muted)] truncate">{email}</p>
          </div>
          <form action={signOut}>
            <button type="submit" aria-label="Sign out" className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[rgba(31,42,46,0.06)] transition-colors">
              <LogOut size={14} strokeWidth={1.8} />
            </button>
          </form>
        </div>
      </aside>

      {/* ── Bottom tab bar ── mobile only */}
      <nav className="flex lg:hidden fixed bottom-0 inset-x-0 z-30 bg-background/95 backdrop-blur-sm border-t border-[var(--sep)] h-[60px]">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          const count = badgeCount(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5"
            >
              <div className={['relative', active ? 'text-primary' : 'text-[var(--text-muted)]'].join(' ')}>
                <Icon size={22} strokeWidth={active ? 2 : 1.6} />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1.5 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold inline-flex items-center justify-center tabular-nums leading-none">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </div>
              <span className={['text-[10px] font-medium leading-none', active ? 'text-primary' : 'text-[var(--text-muted)]'].join(' ')}>
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
