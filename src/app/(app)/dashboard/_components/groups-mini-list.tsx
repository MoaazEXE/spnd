import Link from 'next/link'
import { Users } from 'lucide-react'
import { fmtRM } from '@/lib/formatters'

// TODO: Sprint 2 — replace with real group data from groupsRepo
interface MockGroup {
  id: string
  name: string
  memberCount: number
  totalSavedCents: number
}

const MOCK_GROUPS: MockGroup[] = [
  { id: '1', name: 'Tokyo Trip',   memberCount: 4, totalSavedCents: 6800 },
  { id: '2', name: 'Flat 3B',      memberCount: 2, totalSavedCents: 4500 },
]

// Small palette of avatar tints so each group card looks distinct
const TINTS = [
  { bg: 'bg-[var(--primary-tint)]', fg: 'text-primary' },
  { bg: 'bg-[var(--gold-tint)]',    fg: 'text-[var(--gold-deep)]' },
  { bg: 'bg-[var(--coral-tint)]',   fg: 'text-[var(--coral-deep)]' },
]

function GroupCard({ group, tint }: { group: MockGroup; tint: typeof TINTS[number] }) {
  return (
    <Link
      href="/groups"
      className="block rounded-[16px] bg-card px-4 py-3.5 shadow-[0_1px_2px_rgba(31,42,46,0.04),0_4px_16px_rgba(31,42,46,0.04)] transition-all duration-200 ease-out hover:-translate-y-[3px] hover:shadow-[0_4px_8px_rgba(31,42,46,0.05),0_16px_32px_rgba(31,42,46,0.10)] active:translate-y-0"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-[10px] ${tint.bg} flex items-center justify-center flex-shrink-0`}>
          <Users size={18} strokeWidth={1.8} className={tint.fg} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-foreground truncate">{group.name}</p>
          <p className="text-[12px] text-[var(--text-muted)]">{group.memberCount} members</p>
        </div>
        <span className="text-[14px] font-semibold text-primary tabular-nums flex-shrink-0">
          +{fmtRM(group.totalSavedCents, 0)}
        </span>
      </div>
    </Link>
  )
}

export function GroupsMiniList() {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-semibold uppercase tracking-[0.2px] text-[var(--text-muted)]">
          Your groups
        </p>
        <Link href="/groups" className="text-[12px] font-medium text-[var(--primary-deep)] hover:underline">
          See all →
        </Link>
      </div>

      {MOCK_GROUPS.length === 0 ? (
        <div className="rounded-[16px] bg-card px-4 py-6 text-center shadow-[0_1px_2px_rgba(31,42,46,0.04),0_4px_16px_rgba(31,42,46,0.04)]">
          <p className="text-[13px] text-[var(--text-subtle)]">No groups yet.</p>
        </div>
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
