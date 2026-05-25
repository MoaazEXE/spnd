import { redirect } from 'next/navigation'
import { itemsRepo } from '@/data/items.repo'
import { getUserContext } from '@/lib/user-context'
import { CoolingView } from './_components/cooling-view'

type Tab = 'cooling' | 'skipped' | 'bought' | 'all'

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function CoolingPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const initialTab: Tab =
    sp.tab === 'skipped' || sp.tab === 'bought' || sp.tab === 'all' ? sp.tab : 'cooling'

  const ctx = await getUserContext()
  if (!ctx) redirect('/login')

  const [cooling, skipped, bought] = await Promise.all([
    itemsRepo.findCoolingByUser(ctx.id),
    itemsRepo.findSkippedByUser(ctx.id),
    itemsRepo.findBoughtByUser(ctx.id),
  ])

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

      <CoolingView
        initialTab={initialTab}
        cooling={cooling}
        skipped={skipped}
        bought={bought}
        timeCostContext={ctx.timeCostContext}
      />
    </div>
  )
}
