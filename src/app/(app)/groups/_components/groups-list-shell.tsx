'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Plus, Users } from 'lucide-react'
import { fmtRM } from '@/lib/formatters'
import { Avatar } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { acceptInvite, rejectInvite } from '@/app/actions/groups'
import { CreateGroupSheet } from './create-group-sheet'
import type { GroupSummary, InvitePreview } from '../page'

interface Props {
  groups: GroupSummary[]
  invites: InvitePreview[]
  totalSavedCents: number
  currentUserId: string
}

export function GroupsListShell({ groups, invites, totalSavedCents }: Props) {
  const [creating, setCreating] = useState(false)
  const [pending, startTransition] = useTransition()
  const [actingOn, setActingOn] = useState<string | null>(null)

  function handleAccept(groupId: string) {
    setActingOn(groupId)
    const fd = new FormData()
    fd.set('groupId', groupId)
    startTransition(async () => {
      await acceptInvite(fd)
      setActingOn(null)
    })
  }

  function handleReject(groupId: string) {
    setActingOn(groupId)
    const fd = new FormData()
    fd.set('groupId', groupId)
    startTransition(async () => {
      await rejectInvite(fd)
      setActingOn(null)
    })
  }

  return (
    <div className="max-w-[640px] mx-auto px-5 lg:px-12 pt-6 lg:pt-8 pb-8 lg:pb-16">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
            Groups
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Split real expenses. Cool on shared impulse buys.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          aria-label="Create group"
          className="lg:hidden flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center hover:bg-foreground/5 transition-colors"
        >
          <Plus size={20} strokeWidth={2} className="text-foreground" />
        </button>
      </header>

      {invites.length > 0 && (
        <div className="mb-5 space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {invites.length === 1 ? 'Pending invite' : `Pending invites · ${invites.length}`}
          </p>
          {invites.map(inv => {
            const busy = pending && actingOn === inv.groupId
            return (
              <Card key={inv.groupId} padding="sm" className="border border-primary-soft">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-tint flex items-center justify-center text-primary-deep">
                    <Users size={18} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {inv.groupName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Invited you · {inv.memberCount}{' '}
                      {inv.memberCount === 1 ? 'member' : 'members'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleReject(inv.groupId)}
                    disabled={!!busy}
                    className="flex-1 h-11 lg:h-9 rounded-md text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    {busy ? '…' : 'Reject'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAccept(inv.groupId)}
                    disabled={!!busy}
                    className="flex-1 h-11 lg:h-9 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-deep transition-colors disabled:opacity-50"
                  >
                    {busy ? '…' : 'Accept'}
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <div className="rounded-2xl p-5 mb-5 text-white shadow-card bg-gradient-to-br from-primary to-primary-deep">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
          Saved together
        </p>
        <p className="mt-1 font-display text-4xl font-semibold tabular-nums tracking-tight">
          {fmtRM(totalSavedCents)}
        </p>
        <p className="mt-1 text-xs opacity-70">
          Across {groups.length} {groups.length === 1 ? 'group' : 'groups'}, all time
        </p>
      </div>

      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Your groups
      </p>

      {groups.length === 0 ? (
        <EmptyState
          title="No groups yet."
          subtitle="Create one to split expenses or cool on something together."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {groups.map(g => (
            <GroupRow key={g.id} group={g} />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setCreating(true)}
        className="mt-4 w-full rounded-2xl border-[1.5px] border-dashed border-sep-strong px-4 py-3.5 text-center transition-colors hover:bg-card"
      >
        <p className="text-sm font-semibold text-primary">+ Create new group</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Split, cool, save together</p>
      </button>

      {creating && <CreateGroupSheet onClose={() => setCreating(false)} />}
    </div>
  )
}

function GroupRow({ group }: { group: GroupSummary }) {
  return (
    <Link
      href={`/groups/${group.id}`}
      prefetch
      className="block rounded-2xl bg-card shadow-card px-4 py-3.5 transition-all hover:-translate-y-[2px] hover:shadow-card-hover"
    >
      <div className="flex items-center gap-3.5">
        <Avatar name={group.name} size={46} shape="square" className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-body-lg font-semibold text-foreground truncate">{group.name}</p>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex">
              {group.members.slice(0, 4).map((m, i) => (
                <div
                  key={m.id}
                  className="rounded-full shadow-avatar-ring"
                  style={{ marginLeft: i > 0 ? -6 : 0 }}
                >
                  <Avatar name={m.name} src={m.avatarUrl} size={20} />
                </div>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
            </span>
          </div>
        </div>
        <BalanceBadge cents={group.youOweCents} />
      </div>
    </Link>
  )
}

function BalanceBadge({ cents }: { cents: number }) {
  if (cents === 0) {
    return <span className="text-xs font-medium text-muted-foreground">Settled</span>
  }
  if (cents > 0) {
    return (
      <div className="text-right">
        <p className="text-[11px] font-medium text-muted-foreground">You&apos;re owed</p>
        <p className="text-body-lg font-bold text-primary tabular-nums">
          {fmtRM(cents, 0)}
        </p>
      </div>
    )
  }
  return (
    <div className="text-right">
      <p className="text-[11px] font-medium text-muted-foreground">You owe</p>
      <p className="text-body-lg font-bold text-coral-deep tabular-nums">
        {fmtRM(Math.abs(cents), 0)}
      </p>
    </div>
  )
}
