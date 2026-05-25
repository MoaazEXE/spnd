'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { cn } from '@/lib/utils'

type Tab = 'cooling' | 'skipped' | 'bought' | 'all'

const TABS: { id: Tab; label: string }[] = [
  { id: 'cooling', label: 'Cooling now' },
  { id: 'skipped', label: 'Skipped (saved)' },
  { id: 'bought', label: 'Bought' },
  { id: 'all', label: 'All' },
]

interface Props {
  active: Tab
  counts: Record<Tab, number>
}

export function CoolingTabs({ active, counts }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()

  function setTab(tab: Tab) {
    const sp = new URLSearchParams(searchParams.toString())
    sp.set('tab', tab)
    startTransition(() => router.push(`/cooling?${sp.toString()}`))
  }

  return (
    <div className="flex gap-2 flex-wrap" data-pending={pending}>
      {TABS.map(t => {
        const isActive = t.id === active
        const count = counts[t.id]
        return (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'h-10 px-4 rounded-md text-sm font-semibold transition-all flex items-center gap-2',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-foreground hover:bg-muted',
            )}
          >
            {t.label}
            {count > 0 && (
              <span
                className={cn(
                  'h-5 min-w-5 px-1.5 rounded-full text-[11px] font-semibold inline-flex items-center justify-center tabular-nums',
                  isActive
                    ? 'bg-primary-deep text-primary-foreground'
                    : 'bg-foreground/6 text-muted-foreground',
                )}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
