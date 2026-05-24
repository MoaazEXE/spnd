import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase/server'
import { itemsRepo } from '@/data/items.repo'
import { usersRepo } from '@/data/users.repo'
import { CoolingTabs } from './_components/cooling-tabs'
import { CoolingGrid } from './_components/cooling-grid'
import { HistoryCard } from './_components/history-card'
import type { TimeCostInput } from '@/types'

type Tab = 'cooling' | 'skipped' | 'bought' | 'all'

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function CoolingPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const tab: Tab =
    sp.tab === 'skipped' || sp.tab === 'bought' || sp.tab === 'all' ? sp.tab : 'cooling'

  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const [cooling, skipped, bought, dbUser] = await Promise.all([
    itemsRepo.findCoolingByUser(user.id),
    itemsRepo.findSkippedByUser(user.id),
    itemsRepo.findBoughtByUser(user.id),
    usersRepo.findById(user.id),
  ])

  const counts = {
    cooling: cooling.length,
    skipped: skipped.length,
    bought:  bought.length,
    all:     cooling.length + skipped.length + bought.length,
  }

  const timeCostContext: Omit<TimeCostInput, 'amountCents'> | null =
    dbUser?.monthlyIncomeCents && dbUser.workingHoursPerWeek
      ? {
          monthlyIncomeCents: dbUser.monthlyIncomeCents,
          workingHoursPerWeek: dbUser.workingHoursPerWeek,
          mode: dbUser.timeCostMode,
          commuteHours: dbUser.commuteHours ?? undefined,
          workCostsCents: dbUser.workCostsCents ?? undefined,
        }
      : null

  return (
    <div className="max-w-[520px] lg:max-w-[1080px] mx-auto px-5 lg:px-12 pt-6 lg:pt-8 pb-8 lg:pb-16">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-[28px] lg:text-[34px] font-semibold text-foreground tracking-[-0.6px]" style={{ fontFamily: 'var(--font-fraunces, inherit)' }}>
          Cooling
        </h1>
        <p className="text-[14px] text-[var(--text-muted)] mt-1">Everything you&apos;ve paused before buying.</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <CoolingTabs active={tab} counts={counts} />
      </div>

      {/* Body */}
      {tab === 'cooling' && (
        <CoolingGrid items={cooling} timeCostContext={timeCostContext} />
      )}

      {tab === 'skipped' && (
        skipped.length === 0 ? (
          <EmptyState title="No saved items yet" subtitle="Skipped purchases will show here once you start resolving cooling items." />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {skipped.map(i => (
              <HistoryCard key={i.id} item={{ id: i.id, title: i.title, amountCents: i.amountCents, status: 'SKIPPED', resolvedAt: i.resolvedAt }} />
            ))}
          </div>
        )
      )}

      {tab === 'bought' && (
        bought.length === 0 ? (
          <EmptyState title="No bought items yet" subtitle="Items you resolved with Buy will show here." />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {bought.map(i => (
              <HistoryCard key={i.id} item={{ id: i.id, title: i.title, amountCents: i.amountCents, status: 'BOUGHT', resolvedAt: i.resolvedAt }} />
            ))}
          </div>
        )
      )}

      {tab === 'all' && (
        <div className="space-y-6">
          {cooling.length > 0 && (
            <section>
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.2px] text-[var(--text-muted)] mb-3">Cooling now</h2>
              <CoolingGrid items={cooling} timeCostContext={timeCostContext} />
            </section>
          )}
          {skipped.length > 0 && (
            <section>
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.2px] text-[var(--text-muted)] mb-3">Skipped</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {skipped.map(i => (
                  <HistoryCard key={i.id} item={{ id: i.id, title: i.title, amountCents: i.amountCents, status: 'SKIPPED', resolvedAt: i.resolvedAt }} />
                ))}
              </div>
            </section>
          )}
          {bought.length > 0 && (
            <section>
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.2px] text-[var(--text-muted)] mb-3">Bought</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {bought.map(i => (
                  <HistoryCard key={i.id} item={{ id: i.id, title: i.title, amountCents: i.amountCents, status: 'BOUGHT', resolvedAt: i.resolvedAt }} />
                ))}
              </div>
            </section>
          )}
          {cooling.length === 0 && skipped.length === 0 && bought.length === 0 && (
            <EmptyState title="Nothing here yet" subtitle="Log your first temptation from the top bar." />
          )}
        </div>
      )}
    </div>
  )
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-[20px] bg-card py-12 px-5 text-center shadow-[0_1px_2px_rgba(31,42,46,0.04),0_4px_16px_rgba(31,42,46,0.04)]">
      <p className="text-[15px] font-semibold text-foreground">{title}</p>
      <p className="text-[13px] text-[var(--text-muted)] mt-1">{subtitle}</p>
    </div>
  )
}
