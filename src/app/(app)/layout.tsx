import { getCurrentUser } from '@/lib/supabase/server'
import { itemsRepo } from '@/data/items.repo'
import { usersRepo } from '@/data/users.repo'
import { computeSavedCents } from '@/core/savings/savings'
import { Nav } from './_components/nav'
import { TopBar } from './_components/top-bar'
import { LogModalProvider } from './_components/log-modal-context'
import { ResolveSheetProvider } from './_components/resolve-sheet-context'
import { LogSheetMount } from './_components/log-sheet-mount'
import { ResolveSheetMount } from './_components/resolve-sheet-mount'
import type { TimeCostInput } from '@/types'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  const name = typeof user?.user_metadata?.name === 'string'
    ? user.user_metadata.name
    : user?.email?.split('@')[0] ?? ''
  const email = user?.email ?? ''
  const initial = (name || '?').charAt(0).toUpperCase()

  let savedCents = 0
  let coolingItems: Awaited<ReturnType<typeof itemsRepo.findCoolingByUser>> = []
  let timeCostContext: Omit<TimeCostInput, 'amountCents'> | null = null
  let defaultCoolingPeriod = '1d'

  if (user) {
    const [skipped, cooling, dbUser] = await Promise.all([
      itemsRepo.findSkippedByUser(user.id),
      itemsRepo.findCoolingByUser(user.id),
      usersRepo.findById(user.id),
    ])
    savedCents = computeSavedCents(skipped)
    coolingItems = cooling
    defaultCoolingPeriod = dbUser?.defaultCoolingPeriod ?? '1d'
    timeCostContext =
      dbUser?.monthlyIncomeCents && dbUser.workingHoursPerWeek
        ? {
            monthlyIncomeCents: dbUser.monthlyIncomeCents,
            workingHoursPerWeek: dbUser.workingHoursPerWeek,
            mode: dbUser.timeCostMode,
            commuteHours: dbUser.commuteHours ?? undefined,
            workCostsCents: dbUser.workCostsCents ?? undefined,
          }
        : null
  }

  const coolingForBell = coolingItems.map(i => ({
    id: i.id,
    title: i.title,
    amountCents: i.amountCents,
    coolingUntil: i.coolingUntil,
  }))

  const coolingForResolve = coolingItems.map(i => ({
    id: i.id,
    title: i.title,
    amountCents: i.amountCents,
    coolingUntil: i.coolingUntil,
    createdAt: i.createdAt,
  }))

  return (
    <LogModalProvider>
      <ResolveSheetProvider>
        <div className="min-h-screen flex flex-col lg:flex-row bg-background">
          <Nav
            name={name}
            email={email}
            initial={initial}
            savedCents={savedCents}
            coolingCount={coolingItems.length}
            groupsCount={0}
          />
          <div className="flex-1 min-w-0 flex flex-col">
            <TopBar coolingItems={coolingForBell} userInitial={initial} />
            <main className="flex-1 mb-[60px] lg:mb-0">
              {children}
            </main>
          </div>
        </div>

        {/* Sheets mounted once at layout — persist across navigation */}
        <LogSheetMount
          defaultCoolingPeriod={defaultCoolingPeriod}
          timeCostContext={timeCostContext}
        />
        <ResolveSheetMount
          coolingItems={coolingForResolve}
          timeCostContext={timeCostContext}
        />
      </ResolveSheetProvider>
    </LogModalProvider>
  )
}
