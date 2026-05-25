'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { Search, Clock, Check, ShoppingBag, User, ArrowRight } from 'lucide-react'
import { fmtRM } from '@/lib/formatters'
import { Avatar } from '@/components/ui/avatar'
import { useResolveSheet } from './resolve-sheet-context'
import { cn } from '@/lib/utils'

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

interface SearchMember {
  id: string
  name: string
  email: string
  groupId: string | null
  groupName: string | null
}

interface SearchResponse {
  items: SearchItem[]
  groups: SearchGroup[]
  members: SearchMember[]
  isDefault: boolean
}

interface Props {
  isOpen: boolean
  onClose: () => void
}

const GROUP_HEADING_STYLES =
  '[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground'

export function SearchPalette({ isOpen, onClose }: Props) {
  const router = useRouter()
  const resolveSheet = useResolveSheet()
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<SearchItem[]>([])
  const [groups, setGroups] = useState<SearchGroup[]>([])
  const [members, setMembers] = useState<SearchMember[]>([])
  const [isDefault, setIsDefault] = useState(true)
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
    }
  }, [isOpen])

  // Fetch — runs both on open (empty query → recent) and on every typed query.
  useEffect(() => {
    if (!isOpen) return
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac
    setLoading(true)
    const delay = query.trim() ? 140 : 0
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: ac.signal })
        .then(r => r.json() as Promise<SearchResponse>)
        .then(data => {
          setItems(data.items ?? [])
          setGroups(data.groups ?? [])
          setMembers(data.members ?? [])
          setIsDefault(!!data.isDefault)
          setLoading(false)
        })
        .catch(() => {
          /* aborted */
        })
    }, delay)
    return () => {
      clearTimeout(t)
      ac.abort()
    }
  }, [query, isOpen])

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

  function handleGroupSelect(g: SearchGroup) {
    onClose()
    router.push(`/groups/${g.id}`)
  }

  function handleMemberSelect(m: SearchMember) {
    onClose()
    if (m.groupId) router.push(`/groups/${m.groupId}`)
  }

  if (!isOpen) return null

  const totalResults = items.length + groups.length + members.length
  const showEmpty = !loading && !isDefault && query.trim() && totalResults === 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-foreground/45 backdrop-blur-sm" />
      <Command
        className="relative w-full max-w-[640px] bg-card rounded-2xl shadow-pop overflow-hidden animate-pop"
        onClick={e => e.stopPropagation()}
        label="Search Settle"
        shouldFilter={false}
      >
        <div className="flex items-center gap-3 px-5 h-14 border-b border-sep">
          <Search size={18} strokeWidth={1.8} className="flex-shrink-0 text-muted-foreground" />
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="Search items, groups, or members…"
            className="flex-1 bg-transparent border-none outline-none text-base font-medium text-foreground placeholder:text-subtle-foreground"
            autoFocus
          />
          <kbd className="text-[11px] font-semibold text-subtle-foreground bg-background border border-border rounded-xs px-2 py-0.5">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-[440px] overflow-y-auto px-2 py-2">
          {showEmpty && (
            <Command.Empty className="px-4 py-10 text-center">
              <p className="text-sm font-semibold text-foreground">
                No matches for &ldquo;{query}&rdquo;
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try a partial title, a group name, or a person&apos;s email.
              </p>
            </Command.Empty>
          )}

          {isDefault && items.length === 0 && (
            <p className="px-4 py-10 text-center text-xs text-subtle-foreground">
              Start typing to search items, groups, and members.
            </p>
          )}

          {isDefault && items.length > 0 && (
            <Command.Group heading="Recent" className={GROUP_HEADING_STYLES}>
              {items.map(item => (
                <ItemRow key={item.id} item={item} onSelect={handleItemSelect} />
              ))}
            </Command.Group>
          )}

          {!isDefault && items.length > 0 && (
            <Command.Group heading="Items" className={GROUP_HEADING_STYLES}>
              {items.map(item => (
                <ItemRow key={item.id} item={item} onSelect={handleItemSelect} />
              ))}
            </Command.Group>
          )}

          {groups.length > 0 && (
            <Command.Group heading="Groups" className={GROUP_HEADING_STYLES}>
              {groups.map(g => (
                <Command.Item
                  key={g.id}
                  value={`group-${g.id}-${g.name}`}
                  onSelect={() => handleGroupSelect(g)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer data-[selected=true]:bg-primary-tint/60"
                >
                  <Avatar name={g.name} size={36} shape="square" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{g.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {g.memberCount} {g.memberCount === 1 ? 'member' : 'members'}
                    </p>
                  </div>
                  <ArrowRight
                    size={14}
                    strokeWidth={1.8}
                    className="text-subtle-foreground flex-shrink-0"
                  />
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {members.length > 0 && (
            <Command.Group heading="People" className={GROUP_HEADING_STYLES}>
              {members.map(m => (
                <Command.Item
                  key={m.id}
                  value={`member-${m.id}-${m.name}`}
                  onSelect={() => handleMemberSelect(m)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer data-[selected=true]:bg-primary-tint/60"
                >
                  <Avatar name={m.name} size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{m.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {m.groupName ? `Shared in ${m.groupName}` : m.email}
                    </p>
                  </div>
                  <User
                    size={14}
                    strokeWidth={1.8}
                    className="text-subtle-foreground flex-shrink-0"
                  />
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>
      </Command>
    </div>
  )
}

function ItemRow({
  item,
  onSelect,
}: {
  item: SearchItem
  onSelect: (i: SearchItem) => void
}) {
  const Icon =
    item.status === 'COOLING'
      ? Clock
      : item.status === 'SKIPPED'
        ? Check
        : ShoppingBag
  const iconBg =
    item.status === 'COOLING'
      ? 'bg-primary-tint text-primary'
      : item.status === 'SKIPPED'
        ? 'bg-gold-tint text-gold-deep'
        : 'bg-coral-tint text-coral-deep'
  return (
    <Command.Item
      value={`item-${item.id}-${item.title}`}
      onSelect={() => onSelect(item)}
      className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer data-[selected=true]:bg-primary-tint/60"
    >
      <div className={cn('flex-shrink-0 w-9 h-9 rounded-sm flex items-center justify-center', iconBg)}>
        <Icon size={16} strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
        <p className="text-[11px] text-muted-foreground capitalize">{item.status.toLowerCase()}</p>
      </div>
      <span className="flex-shrink-0 text-sm font-semibold tabular-nums text-foreground">
        {fmtRM(item.amountCents, 0)}
      </span>
    </Command.Item>
  )
}
