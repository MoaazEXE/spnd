'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Clock, Users, Wallet, LogOut } from 'lucide-react'
import { signOut } from '@/app/actions/auth'
import { useFmt } from '@/lib/currency-context'
import { BrandMark } from '@/components/ui/brand-mark'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/cooling', label: 'Cooling', icon: Clock },
  { href: '/groups', label: 'Groups', icon: Users },
  { href: '/settings', label: 'Income', icon: Wallet },
] as const

interface Props {
  name: string
  email: string
  initial: string
  avatarUrl?: string | null
  savedCents: number
  coolingCount: number
  groupsCount: number
}

export function Nav({ name, email, initial, avatarUrl, savedCents, coolingCount, groupsCount }: Props) {
  const pathname = usePathname()
  const fmt = useFmt()

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  const badgeCount = (href: string) => {
    if (href === '/cooling') return coolingCount
    if (href === '/groups') return groupsCount
    return 0
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 h-screen sticky top-0 border-r border-sep bg-bg-deep flex-col px-4 pt-6 pb-5">
        <div className="px-2 pb-5">
          <BrandMark size="md" href="/dashboard" />
        </div>

        <div className="mb-5 rounded-lg bg-card px-4 py-3.5 shadow-card">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Saved by waiting
          </p>
          <p className="mt-1 font-display text-2xl font-semibold text-primary tracking-tight tabular-nums">
            {fmt(savedCents)}
          </p>
        </div>

        <nav className="flex flex-col gap-0.5 flex-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            const count = badgeCount(href)
            return (
              <Link
                key={href}
                href={href}
                prefetch
                className={cn(
                  'h-10 px-3.5 rounded-sm flex items-center gap-3 text-sm font-medium transition-colors',
                  active
                    ? 'bg-card text-primary-deep shadow-active-inset'
                    : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground',
                )}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span className="flex-1">{label}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      'h-5 min-w-5 px-1.5 rounded-full text-[11px] font-semibold inline-flex items-center justify-center tabular-nums',
                      active
                        ? 'bg-primary-tint text-primary-deep'
                        : 'bg-foreground/6 text-muted-foreground',
                    )}
                  >
                    {count}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2.5 rounded-md bg-card px-3 py-2.5 shadow-card">
          <Link href="/profile" className="flex items-center gap-2.5 flex-1 min-w-0 hover:opacity-80 transition-opacity">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="flex-shrink-0 w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                {initial}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{email}</p>
            </div>
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              aria-label="Sign out"
              className="w-11 h-11 -mr-2 flex items-center justify-center rounded text-muted-foreground hover:bg-foreground/6 transition-colors"
            >
              <LogOut size={14} strokeWidth={1.8} />
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="flex lg:hidden fixed bottom-0 inset-x-0 z-30 bg-background/95 backdrop-blur-sm border-t border-sep h-[60px]">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          const count = badgeCount(href)
          return (
            <Link
              key={href}
              href={href}
              prefetch
              className="flex-1 flex flex-col items-center justify-center gap-0.5"
            >
              <div className={cn('relative', active ? 'text-primary' : 'text-muted-foreground')}>
                <Icon size={22} strokeWidth={active ? 2 : 1.6} />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1.5 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold inline-flex items-center justify-center tabular-nums leading-none">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium leading-none',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
