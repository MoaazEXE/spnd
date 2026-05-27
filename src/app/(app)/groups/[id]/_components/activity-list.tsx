'use client'

import Link from 'next/link'
import { ShoppingBag, Scale } from 'lucide-react'
import { useFmt } from '@/lib/currency-context'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { GroupActivityView } from '../page'

interface Props {
  activity: GroupActivityView[]
  onEdit: (a: GroupActivityView) => void
  memberCount: number
  groupId: string
  showResplitAll: boolean
}

export function ActivityList({
  activity,
  onEdit,
  memberCount,
  groupId,
  showResplitAll,
}: Props) {
  const fmt = useFmt()
  if (activity.length === 0) {
    return (
      <Card className="text-center py-8" padding="none">
        <p className="text-sm font-semibold text-foreground">No activity yet.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Add your first expense to start splitting.
        </p>
      </Card>
    )
  }
  return (
    <>
      <div className="flex flex-col gap-2.5">
        {activity.map(a => {
          const isSettlement = a.type === 'settlement'
          const subtitle = isSettlement
            ? 'Settlement'
            : `${a.payerName} paid · split ${
                a.shareCount === memberCount ? 'equally' : `between ${a.shareCount}`
              }`
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => onEdit(a)}
              className="text-left w-full rounded-2xl bg-card shadow-card p-4 transition-all hover:-translate-y-[1px] hover:shadow-card-hover active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                    isSettlement
                      ? 'bg-primary-tint text-primary-deep'
                      : 'bg-coral-tint text-coral-deep',
                  )}
                >
                  <ShoppingBag size={16} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-foreground tabular-nums">
                    {fmt(a.amountCents, 0)}
                  </p>
                  {!isSettlement && a.perPersonCents > 0 && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">
                      You: {fmt(a.perPersonCents, 0)}
                    </p>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {showResplitAll && memberCount > 1 && (
        <Link
          href={`/groups/${groupId}/resplit`}
          prefetch
          className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-sep-strong px-4 py-3 text-sm font-semibold text-primary hover:bg-card transition-colors"
        >
          <Scale size={14} strokeWidth={1.8} />
          Re-split all activities equally
        </Link>
      )}
    </>
  )
}
