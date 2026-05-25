import Link from 'next/link'
import { Users } from 'lucide-react'
import { fmtRM } from '@/lib/formatters'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const TINTS = [
  { bg: 'bg-primary-tint', fg: 'text-primary' },
  { bg: 'bg-gold-tint', fg: 'text-gold-deep' },
  { bg: 'bg-coral-tint', fg: 'text-coral-deep' },
] as const

export interface GroupMiniRow {
  id: string
  name: string
  memberCount: number
  youBalanceCents: number
}

interface Props {
  rows: GroupMiniRow[]
}

export function GroupsMiniList({ rows }: Props) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Your groups
        </p>
        <Link
          href="/groups"
          prefetch
          className="text-xs font-medium text-primary-deep hover:underline"
        >
          See all →
        </Link>
      </div>

      {rows.length === 0 ? (
        <Card className="text-center py-6">
          <p className="text-xs text-subtle-foreground">No groups yet.</p>
          <Link
            href="/groups"
            prefetch
            className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
          >
            Create one →
          </Link>
        </Card>
      ) : (
        <div className="flex flex-col gap-2.5">
          {rows.map((r, i) => (
            <Link
              key={r.id}
              href={`/groups/${r.id}`}
              prefetch
              className="block rounded-xl bg-card px-4 py-3.5 shadow-card transition-all duration-200 ease-out hover:-translate-y-[3px] hover:shadow-card-hover active:translate-y-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex-shrink-0 w-10 h-10 rounded-sm flex items-center justify-center',
                    TINTS[i % TINTS.length].bg,
                  )}
                >
                  <Users
                    size={18}
                    strokeWidth={1.8}
                    className={TINTS[i % TINTS.length].fg}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.memberCount} {r.memberCount === 1 ? 'member' : 'members'}
                  </p>
                </div>
                <BalanceLabel cents={r.youBalanceCents} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

function BalanceLabel({ cents }: { cents: number }) {
  if (cents === 0) {
    return <span className="flex-shrink-0 text-xs font-medium text-muted-foreground">Settled</span>
  }
  if (cents > 0) {
    return (
      <span className="flex-shrink-0 text-sm font-semibold text-primary tabular-nums">
        +{fmtRM(cents, 0)}
      </span>
    )
  }
  return (
    <span className="flex-shrink-0 text-sm font-semibold text-coral-deep tabular-nums">
      −{fmtRM(Math.abs(cents), 0)}
    </span>
  )
}
