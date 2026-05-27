import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase/server'
import { usersRepo } from '@/data/users.repo'
import { CurrencyProvider } from '@/lib/currency-context'
import { LogModalProvider } from './_components/log-modal-context'
import { ResolveSheetProvider } from './_components/resolve-sheet-context'
import { NavData } from './_components/nav-data'
import { NavSkeleton } from './_components/nav-skeleton'
import { TopBarData } from './_components/top-bar-data'
import { TopBarSkeleton } from './_components/top-bar-skeleton'
import { LogSheetData } from './_components/log-sheet-data'
import { ResolveSheetData } from './_components/resolve-sheet-data'
import { LogFab } from './_components/log-fab'

/**
 * Layout pays for ONE thing only — a cookie-local auth check (no DB).
 * Everything else streams in via Suspense so the route-segment shell
 * paints immediately on every navigation.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const initial =
    typeof user.user_metadata?.name === 'string'
      ? (user.user_metadata.name as string).charAt(0).toUpperCase()
      : (user.email ?? 'U').charAt(0).toUpperCase()
  const name =
    typeof user.user_metadata?.name === 'string'
      ? (user.user_metadata.name as string)
      : user.email?.split('@')[0] ?? 'You'

  // Read currency for provider — cheap cached call
  const dbUser = await usersRepo.findById(user.id)
  const currency = dbUser?.currency ?? 'MYR'

  return (
    <CurrencyProvider currency={currency}>
    <LogModalProvider>
      <ResolveSheetProvider>
        <div className="min-h-screen flex flex-col lg:flex-row bg-background">
          <Suspense
            fallback={<NavSkeleton name={name} email={user.email ?? ''} initial={initial} />}
          >
            <NavData />
          </Suspense>
          <div className="flex-1 min-w-0 flex flex-col">
            <Suspense fallback={<TopBarSkeleton initial={initial} />}>
              <TopBarData initial={initial} />
            </Suspense>
            <main className="flex-1 mb-[60px] lg:mb-0">{children}</main>
          </div>
        </div>

        <LogFab />

        {/* Sheets are invisible until opened — stream in lazily without blocking. */}
        <Suspense fallback={null}>
          <LogSheetData />
        </Suspense>
        <Suspense fallback={null}>
          <ResolveSheetData />
        </Suspense>
      </ResolveSheetProvider>
    </LogModalProvider>
    </CurrencyProvider>
  )
}
