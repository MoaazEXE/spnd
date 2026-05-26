import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getUserContext } from '@/lib/user-context'
import { buildGreeting, buildDateLabel } from '@/lib/greeting'
import { HeroRow } from './_components/sections/hero-row'
import { CoolingSection } from './_components/sections/cooling-section'
import { BottomRow } from './_components/sections/bottom-row'
import { ReviewPillSection } from './_components/sections/review-pill-section'
import {
  HeroRowSkeleton,
  CoolingSectionSkeleton,
  BottomRowSkeleton,
} from './_components/sections/skeletons'

export default async function DashboardPage() {
  const ctx = await getUserContext()
  if (!ctx) redirect('/login')

  return (
    <div className="max-w-[520px] lg:max-w-[1080px] mx-auto px-5 lg:px-12 pt-6 lg:pt-8 pb-8 lg:pb-16">
      <div className="mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {buildDateLabel()}
          </p>
          <h1 className="mt-0.5 font-display text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
            {buildGreeting(ctx.name)}
          </h1>
        </div>
        <Suspense fallback={null}>
          <ReviewPillSection userId={ctx.id} />
        </Suspense>
      </div>

      <Suspense fallback={<HeroRowSkeleton />}>
        <HeroRow userId={ctx.id} timeCostContext={ctx.timeCostContext} />
      </Suspense>

      <Suspense fallback={<CoolingSectionSkeleton />}>
        <CoolingSection userId={ctx.id} timeCostContext={ctx.timeCostContext} />
      </Suspense>

      <Suspense fallback={<BottomRowSkeleton />}>
        <BottomRow userId={ctx.id} />
      </Suspense>
    </div>
  )
}
