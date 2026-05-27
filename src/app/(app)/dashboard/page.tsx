import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getUserContext } from '@/lib/user-context'
import { buildGreeting, buildDateLabel } from '@/lib/greeting'
import { GreetingClient } from './_components/greeting-client'
import { HeroRow } from './_components/sections/hero-row'
import { CoolingSection } from './_components/sections/cooling-section'
import { BottomRow } from './_components/sections/bottom-row'
import { ReviewPillSection } from './_components/sections/review-pill-section'
import { NextMilestoneSection } from './_components/sections/next-milestone-section'
import {
  HeroRowSkeleton,
  CoolingSectionSkeleton,
  BottomRowSkeleton,
} from './_components/sections/skeletons'

export default async function DashboardPage() {
  const ctx = await getUserContext()
  if (!ctx) redirect('/login')

  const hdrs = await headers()
  const timezone = hdrs.get('x-vercel-ip-timezone') ?? 'UTC'

  return (
    <div className="max-w-[520px] lg:max-w-[1080px] mx-auto px-5 lg:px-12 pt-6 lg:pt-8 pb-8 lg:pb-16">
      <div className="mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        <GreetingClient
          name={ctx.name}
          initialGreeting={buildGreeting(ctx.name)}
          initialDate={buildDateLabel()}
        />
        <Suspense fallback={null}>
          <ReviewPillSection userId={ctx.id} />
        </Suspense>
      </div>

      <Suspense fallback={null}>
        <NextMilestoneSection userId={ctx.id} />
      </Suspense>

      <Suspense fallback={<HeroRowSkeleton />}>
        <HeroRow userId={ctx.id} timeCostContext={ctx.timeCostContext} timezone={timezone} />
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
