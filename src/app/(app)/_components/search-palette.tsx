'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { Search, Clock, Check, ShoppingBag, Users } from 'lucide-react'
import { fmtRM } from '@/lib/formatters'
import { useResolveSheet } from './resolve-sheet-context'

interface SearchItem {
  id: string
  title: string
  amountCents: number
  status: 'COOLING' | 'SKIPPED' | 'BOUGHT'
  coolingUntil: string
}

interface SearchGroup {
  id: string
  name: string
  memberCount: number
}

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function SearchPalette({ isOpen, onClose }: Props) {
  const router = useRouter()
  const resolveSheet = useResolveSheet()
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<SearchItem[]>([])
  const [groups, setGroups] = useState<SearchGroup[]>([])
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setItems([])
      setGroups([])
    }
  }, [isOpen])

  useEffect(() => {
    if (!query.trim()) {
      setItems([])
      setGroups([])
      return
    }
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac
    setLoading(true)
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: ac.signal })
        .then(r => r.json())
        .then(data => {
          setItems(data.items ?? [])
          setGroups(data.groups ?? [])
          setLoading(false)
        })
        .catch(() => { /* aborted */ })
    }, 150)
    return () => { clearTimeout(t); ac.abort() }
  }, [query])

  function handleItemSelect(item: SearchItem) {
    onClose()
    if (item.status === 'COOLING') {
      router.push('/dashboard')
      setTimeout(() => resolveSheet.open(item.id), 60)
    } else if (item.status === 'SKIPPED') {
      router.push('/cooling?tab=skipped')
    } else {
      router.push('/cooling?tab=bought')
    }
  }

  function handleGroupSelect(_: SearchGroup) {
    onClose()
    router.push('/groups')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[rgba(31,42,46,0.45)] backdrop-blur-sm" />
      <Command
        className="relative w-full max-w-[640px] bg-card rounded-[20px] shadow-[0_24px_60px_rgba(31,42,46,0.32)] overflow-hidden animate-pop"
        onClick={e => e.stopPropagation()}
        label="Search Settle"
        shouldFilter={false}
      >
        <div className="flex items-center gap-3 px-5 h-14 border-b border-[var(--sep)]">
          <Search size={18} strokeWidth={1.8} className="text-[var(--text-muted)] flex-shrink-0" />
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="Search items, groups, or members…"
            className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium text-foreground placeholder:text-[var(--text-subtle)]"
            autoFocus
          />
          <kbd className="text-[11px] font-semibold text-[var(--text-subtle)] bg-background border border-border rounded-[6px] px-2 py-0.5">ESC</kbd>
        </div>

        <Command.List className="max-h-[420px] overflow-y-auto px-2 py-2">
          {!query.trim() && (
            <p className="px-4 py-8 text-center text-[13px] text-[var(--text-subtle)]">
              Type to search across items and groups.
            </p>
          )}

          {query.trim() && !loading && items.length === 0 && groups.length === 0 && (
            <Command.Empty className="px-4 py-8 text-center text-[13px] text-[var(--text-subtle)]">
              No matches for &ldquo;{query}&rdquo;
            </Command.Empty>
          )}

          {items.length > 0 && (
            <Command.Group heading="Items" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.4px] [&_[cmdk-group-heading]]:text-[var(--text-muted)]">
              {items.map(item => {
                const Icon = item.status === 'COOLING' ? Clock : item.status === 'SKIPPED' ? Check : ShoppingBag
                const iconBg =
                  item.status === 'COOLING' ? 'bg-[var(--primary-tint)] text-primary'
                  : item.status === 'SKIPPED' ? 'bg-[var(--gold-tint)] text-[var(--gold-deep)]'
                  : 'bg-[var(--coral-tint)] text-[var(--coral-deep)]'
                return (
                  <Command.Item
                    key={item.id}
                    value={`item-${item.id}-${item.title}`}
                    onSelect={() => handleItemSelect(item)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] cursor-pointer data-[selected=true]:bg-[var(--primary-tint)]/60"
                  >
                    <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                      <Icon size={16} strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-foreground truncate">{item.title}</p>
                      <p className="text-[11px] text-[var(--text-muted)] capitalize">{item.status.toLowerCase()}</p>
                    </div>
                    <span className="text-[14px] font-semibold tabular-nums text-foreground flex-shrink-0">
                      {fmtRM(item.amountCents, 0)}
                    </span>
                  </Command.Item>
                )
              })}
            </Command.Group>
          )}

          {groups.length > 0 && (
            <Command.Group heading="Groups" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.4px] [&_[cmdk-group-heading]]:text-[var(--text-muted)]">
              {groups.map(g => (
                <Command.Item
                  key={g.id}
                  value={`group-${g.id}-${g.name}`}
                  onSelect={() => handleGroupSelect(g)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] cursor-pointer data-[selected=true]:bg-[var(--primary-tint)]/60"
                >
                  <div className="w-9 h-9 rounded-[10px] bg-[var(--primary-tint)] flex items-center justify-center flex-shrink-0">
                    <Users size={16} strokeWidth={1.8} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-foreground truncate">{g.name}</p>
                    <p className="text-[11px] text-[var(--text-muted)]">{g.memberCount} members</p>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>
      </Command>
    </div>
  )
}
