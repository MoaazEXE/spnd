'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { ThumbsUp, ThumbsDown, Check, X, Clock } from 'lucide-react'
import { reactToProposal, commitProposal, cancelProposal } from '@/app/actions/groups'
import { Avatar } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { useFmt } from '@/lib/currency-context'
import { cn } from '@/lib/utils'
import type { GroupProposalView } from '../page'

function fmtCountdown(isoDate: string): string {
  const ms = new Date(isoDate).getTime() - Date.now()
  if (ms <= 0) return 'Cooling done'
  const d = Math.floor(ms / 86400000)
  const h = Math.floor((ms % 86400000) / 3600000)
  if (d > 0) return `${d}d ${h}h left`
  return `${h}h left`
}

interface Props {
  proposal: GroupProposalView
  currentUserId: string
}

export function ProposalCard({ proposal, currentUserId }: Props) {
  const fmt = useFmt()
  const [isPending, startTransition] = useTransition()

  const coolingDone = new Date(proposal.coolingUntil) <= new Date()
  const isProposer = proposal.proposerId === currentUserId
  const inCount = proposal.reactions.filter(r => r.reaction === 'IN').length
  const skipCount = proposal.reactions.filter(r => r.reaction === 'SKIP').length
  const totalReacted = inCount + skipCount
  const totalMembers = proposal.reactions.length

  function react(reaction: 'IN' | 'SKIP') {
    startTransition(async () => {
      const fd = new FormData()
      fd.set('expenseId', proposal.id)
      fd.set('reaction', reaction)
      try {
        await reactToProposal(fd)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not react.')
      }
    })
  }

  function commit() {
    startTransition(async () => {
      const fd = new FormData()
      fd.set('expenseId', proposal.id)
      try {
        await commitProposal(fd)
        toast.success('Proposal committed — expense added to the group.')
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not commit.')
      }
    })
  }

  function cancel() {
    startTransition(async () => {
      const fd = new FormData()
      fd.set('expenseId', proposal.id)
      try {
        await cancelProposal(fd)
        toast.success('Cooling proposal cancelled.')
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not cancel.')
      }
    })
  }

  return (
    <Card padding="md" className={cn('space-y-3', isPending && 'opacity-60')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{proposal.description}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Proposed by {proposal.proposerName} · {fmt(proposal.amountCents, 0)}
          </p>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground flex-shrink-0">
          <Clock size={12} strokeWidth={2} />
          {fmtCountdown(proposal.coolingUntil)}
        </div>
      </div>

      {/* Reactions row */}
      <div className="flex items-center gap-1.5">
        {proposal.reactions.map(r => (
          <div
            key={r.userId}
            title={`${r.userName}: ${r.reaction ?? 'no reaction'}`}
            className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-background',
              r.reaction === 'IN' ? 'bg-primary text-primary-foreground' :
              r.reaction === 'SKIP' ? 'bg-destructive/15 text-destructive' :
              'bg-muted text-muted-foreground',
            )}
          >
            <Avatar name={r.userName} src={r.avatarUrl} size={28} />
          </div>
        ))}
        <span className="ml-1 text-[11px] text-muted-foreground">
          {totalReacted}/{totalMembers} reacted · {inCount} in · {skipCount} skip
        </span>
      </div>

      {/* My reaction buttons */}
      {!proposal.isCommitted && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => react('IN')}
            disabled={isPending}
            className={cn(
              'flex-1 h-10 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-colors',
              proposal.myReaction === 'IN'
                ? 'bg-primary text-primary-foreground'
                : 'bg-primary-tint text-primary-deep hover:bg-primary-soft',
            )}
          >
            <ThumbsUp size={14} strokeWidth={2} />
            I&apos;m in
          </button>
          <button
            type="button"
            onClick={() => react('SKIP')}
            disabled={isPending}
            className={cn(
              'flex-1 h-10 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-colors',
              proposal.myReaction === 'SKIP'
                ? 'bg-destructive/15 text-destructive border border-destructive/20'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            <ThumbsDown size={14} strokeWidth={2} />
            Skip
          </button>
        </div>
      )}

      {/* Proposer actions: commit or cancel */}
      {isProposer && !proposal.isCommitted && (
        <div className="flex gap-2 pt-1 border-t border-sep">
          <button
            type="button"
            onClick={cancel}
            disabled={isPending}
            className="flex-1 h-9 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:bg-muted inline-flex items-center justify-center gap-1.5 transition-colors"
          >
            <X size={13} strokeWidth={2} />
            Cancel
          </button>
          {coolingDone && (
            <button
              type="button"
              onClick={commit}
              disabled={isPending}
              className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground text-xs font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-primary-deep transition-colors"
            >
              <Check size={13} strokeWidth={2} />
              Commit expense
            </button>
          )}
        </div>
      )}
    </Card>
  )
}
