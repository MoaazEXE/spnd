import { redirect } from 'next/navigation'
import { itemsRepo } from '@/data/items.repo'
import { getUserContext } from '@/lib/user-context'
import { CoolingTabs } from './_components/cooling-tabs'
import { CoolingGrid } from './_components/cooling-grid'
import { HistoryCard } from './_components/history-card'

type Tab = 'cooling' | 'skipped' | 'bought' | 'all'

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function CoolingPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const tab: Tab =
    sp.tab === 'skipped' || sp.tab === 'bought' || sp.tab === 'all' ? sp.tab : 'cooling'

  const ctx = await getUserContext()
  if (!ctx) redirect('/login')

  const [cooling, skipped, bought] = await Promise.all([
    itemsRepo.findCoolingByUser(ctx.id),
    itemsRepo.findSkippedByUser(ctx.id),
    itemsRepo.findBoughtByUser(ctx.id),
  ])

  const counts = {
    cooling: cooling.length,
    skipped: skipped.length,
    bought: bought.length,
    all: cooling.length + skipped.length + bought.length,
  }

  return (
    <div className="max-w-[520px] lg:max-w-[1080px] mx-auto px-5 lg:px-12 pt-6 lg:pt-8 pb-8 lg:pb-16">
      <header className="mb-5">
        <h1 className="font-display text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
          Cooling
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything you&apos;ve paused before buying.
        </p>
      </header>

      <div className="mb-6">
        <CoolingTabs active={tab} counts={counts} />
      </div>

      {tab === 'cooling' && (
        <CoolingGrid items={cooling} timeCostContext={ctx.timeCostContext} />
      )}

      {tab === 'skipped' &&
        (skipped.length === 0 ? (
          <EmptyState
            title="No saved items yet"
            subtitle="Skipped purchases will show here once you start resolving cooling items."
          />
        ) : (
          <HistoryGrid items={skipped} status="SKIPPED" />
        ))}

      {tab === 'bought' &&
        (bought.length === 0 ? (
          <EmptyState
            title="No bought items yet"
            subtitle="Items you resolved with Buy will show here."
          />
        ) : (
          <HistoryGrid items={bought} status="BOUGHT" />
        ))}

      {tab === 'all' && (
        <div className="space-y-6">
          {cooling.length > 0 && (
            <Section title="Cooling now">
              <CoolingGrid items={cooling} timeCostContext={ctx.timeCostContext} />
            </Section>
          )}
          {skipped.length > 0 && (
            <Section title="Skipped">
              <HistoryGrid items={skipped} status="SKIPPED" />
            </Section>
          )}
          {bought.length > 0 && (
            <Section title="Bought">
              <HistoryGrid items={bought} status="BOUGHT" />
            </Section>
          )}
          {cooling.length + skipped.length + bought.length === 0 && (
            <EmptyState
              title="Nothing here yet"
              subtitle="Log your first temptation from the top bar."
            />
          )}
        </div>
      )}
    </div>
  )
}

interface HistoryItem {
  id: string
  title: string
  amountCents: number
  resolvedAt: Date | null
}

function HistoryGrid({ items, status }: { items: HistoryItem[]; status: 'SKIPPED' | 'BOUGHT' }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {items.map(i => (
        <HistoryCard
          key={i.id}
          item={{
            id: i.id,
            title: i.title,
            amountCents: i.amountCents,
            status,
            resolvedAt: i.resolvedAt,
          }}
        />
      ))}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  )
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-card bg-card py-12 px-5 text-center shadow-card">
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  )
}
