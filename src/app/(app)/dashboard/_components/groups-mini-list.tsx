import Link from 'next/link'
import { Users } from 'lucide-react'
import { fmtRM } from '@/lib/formatters'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// TODO: Sprint 2 — replace with real group data from groupsRepo
interface MockGroup {
  id: string
  name: string
  memberCount: number
  totalSavedCents: number
}

const MOCK_GROUPS: MockGroup[] = [
  { id: '1', name: 'Tokyo Trip', memberCount: 4, totalSavedCents: 6800 },
  { id: '2', name: 'Flat 3B', memberCount: 2, totalSavedCents: 4500 },
]

const TINTS = [
  { bg: 'bg-primary-tint', fg: 'text-primary' },
  { bg: 'bg-gold-tint', fg: 'text-gold-deep' },
  { bg: 'bg-coral-tint', fg: 'text-coral-deep' },
] as const

function GroupCard({ group, tint }: { group: MockGroup; tint: (typeof TINTS)[number] }) {
  return (
    <Link
      href="/groups"
      prefetch
      className="block rounded-xl bg-card px-4 py-3.5 shadow-card transition-all duration-200 ease-out hover:-translate-y-[3px] hover:shadow-card-hover active:translate-y-0"
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-sm flex items-center justify-center',
            tint.bg,
          )}
        >
          <Users size={18} strokeWidth={1.8} className={tint.fg} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{group.name}</p>
          <p className="text-xs text-muted-foreground">{group.memberCount} members</p>
        </div>
        <span className="flex-shrink-0 text-sm font-semibold text-primary tabular-nums">
          +{fmtRM(group.totalSavedCents, 0)}
        </span>
      </div>
    </Link>
  )
}

export function GroupsMiniList() {
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

      {MOCK_GROUPS.length === 0 ? (
        <Card className="text-center py-6">
          <p className="text-xs text-subtle-foreground">No groups yet.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2.5">
          {MOCK_GROUPS.map((g, i) => (
            <GroupCard key={g.id} group={g} tint={TINTS[i % TINTS.length]} />
          ))}
        </div>
      )}
    </section>
  )
}
