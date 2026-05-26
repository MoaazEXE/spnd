'use client'

import { Avatar } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { fmtRM } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import type { GroupMemberView } from '../page'

interface Props {
  members: GroupMemberView[]
  onInvite: () => void
}

export function MembersList({ members, onInvite }: Props) {
  return (
    <>
      <Card padding="none">
        {members.map((m, i) => (
          <div
            key={m.id}
            className={cn(
              'flex items-center gap-3.5 px-4 py-3.5',
              i < members.length - 1 && 'border-b border-sep',
            )}
          >
            <Avatar name={m.name} src={m.avatarUrl} size={36} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{m.name}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Joined{' '}
                {new Date(m.joinedAt).toLocaleDateString('en-MY', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
            <p
              className={cn(
                'text-xs font-semibold tabular-nums flex-shrink-0',
                m.balanceCents > 0
                  ? 'text-primary'
                  : m.balanceCents < 0
                    ? 'text-coral-deep'
                    : 'text-muted-foreground',
              )}
            >
              {m.balanceCents === 0
                ? '—'
                : (m.balanceCents > 0 ? '+' : '−') + fmtRM(Math.abs(m.balanceCents), 0)}
            </p>
          </div>
        ))}
      </Card>
      <button
        type="button"
        onClick={onInvite}
        className="mt-3 w-full rounded-2xl border-[1.5px] border-dashed border-sep-strong px-4 py-3 text-sm font-semibold text-primary hover:bg-card transition-colors"
      >
        + Invite by email
      </button>
    </>
  )
}
