import { itemsRepo } from '@/data/items.repo'
import { computeSkipRate, summarizeSkipped } from '@/core/savings/savings'
import { timeCostForItem } from '@/lib/timeCostForItem'
import { HeroSavings } from '../hero-savings'
import { SkipRateCard } from '../skip-rate-card'
import { DailySavesCard } from '../daily-saves-card'
import type { TimeCostInput } from '@/types'

interface Props {
  userId: string
  timeCostContext: Omit<TimeCostInput, 'amountCents'> | null
}

export async function HeroRow({ userId, timeCostContext }: Props) {
  const [skipped, bought] = await Promise.all([
    itemsRepo.findSkippedByUser(userId),
    itemsRepo.findBoughtByUser(userId),
  ])

  const summary = summarizeSkipped(skipped, 30)
  const skipRatePct = computeSkipRate(skipped.length, bought.length)
  const heroTimeCost =
    timeCostContext && summary.totalCents > 0
      ? timeCostForItem(timeCostContext, summary.totalCents)
      : undefined

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
      <HeroSavings
        savedCents={summary.totalCents}
        thisMonthCents={summary.thisMonthCents}
        timeCostFormatted={heroTimeCost}
        sparkData={summary.cumulativeByDay}
      />
      <div className="flex flex-col gap-4">
        <SkipRateCard pct={skipRatePct} />
        <DailySavesCard data={summary.rawByDay} />
      </div>
    </div>
  )
}
