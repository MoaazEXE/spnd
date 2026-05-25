'use client'

import { useState } from 'react'
import { CoolingGrid } from './cooling-grid'
import { HistoryCard } from './history-card'
import { CoolingTabs } from './cooling-tabs'
import { EmptyState } from '@/components/ui/empty-state'
import type { TimeCostInput } from '@/types'

type Tab = 'cooling' | 'skipped' | 'bought' | 'all'

interface CoolingItem {
  id: string
  title: string
  amountCents: number
  coolingUntil: Date
  createdAt: Date
}

interface HistoryItem {
  id: string
  title: string
  amountCents: number
  resolvedAt: Date | null
}

interface Props {
  initialTab: Tab
  cooling: CoolingItem[]
  skipped: HistoryItem[]
  bought: HistoryItem[]
  timeCostContext: Omit<TimeCostInput, 'amountCents'> | null
}

export function CoolingView({ initialTab, cooling, skipped, bought, timeCostContext }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab)

  const counts = {
    cooling: cooling.length,
    skipped: skipped.length,
    bought: bought.length,
    all: cooling.length + skipped.length + bought.length,
  }

  return (
    <>
      <div className="mb-6">
        <CoolingTabs active={tab} counts={counts} onChange={setTab} />
      </div>

      {tab === 'cooling' && (
        <CoolingGrid items={cooling} timeCostContext={timeCostContext} />
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
              <CoolingGrid items={cooling} timeCostContext={timeCostContext} />
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
          {counts.all === 0 && (
            <EmptyState
              title="Nothing here yet"
              subtitle="Log your first temptation from the top bar."
            />
          )}
        </div>
      )}
    </>
  )
}

function HistoryGrid({
  items,
  status,
}: {
  items: HistoryItem[]
  status: 'SKIPPED' | 'BOUGHT'
}) {
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
