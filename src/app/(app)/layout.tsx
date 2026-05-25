import { itemsRepo } from '@/data/items.repo'
import { groupsRepo } from '@/data/groups.repo'
import { computeSavedCents } from '@/core/savings/savings'
import { getUserContext } from '@/lib/user-context'
import { Nav } from './_components/nav'
import { TopBar } from './_components/top-bar'
import { LogModalProvider } from './_components/log-modal-context'
import { ResolveSheetProvider } from './_components/resolve-sheet-context'
import { LogSheetMount } from './_components/log-sheet-mount'
import { ResolveSheetMount } from './_components/resolve-sheet-mount'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getUserContext()

  // Empty defaults — the proxy redirects unauthenticated users before they get here,
  // so the only time `ctx` is null is during the brief window where the auth cookie
  // exists but is invalid. Render an empty shell rather than crash.
  if (!ctx) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    )
  }

  // These two reads share the per-request cache with whatever the page also fetches,
  // so child pages pay no extra cost. Parallel for safety.
  const [skipped, cooling, groupsCount, pendingInvites] = await Promise.all([
    itemsRepo.findSkippedByUser(ctx.id),
    itemsRepo.findCoolingByUser(ctx.id),
    groupsRepo.countByUser(ctx.id),
    groupsRepo.findPendingInvitesByUser(ctx.id),
  ])
  const savedCents = computeSavedCents(skipped)
  const invitesForBell = pendingInvites.map(inv => ({
    groupId: inv.groupId,
    groupName: inv.group.name,
    memberCount: inv.group._count.members,
  }))

  const coolingForBell = cooling.map(i => ({
    id: i.id,
    title: i.title,
    amountCents: i.amountCents,
    coolingUntil: i.coolingUntil,
  }))

  const coolingForResolve = cooling.map(i => ({
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
            name={ctx.name}
            email={ctx.email}
            initial={ctx.initial}
            savedCents={savedCents}
            coolingCount={cooling.length}
            groupsCount={groupsCount}
          />
          <div className="flex-1 min-w-0 flex flex-col">
            <TopBar
              coolingItems={coolingForBell}
              invites={invitesForBell}
              userInitial={ctx.initial}
            />
            <main className="flex-1 mb-[60px] lg:mb-0">{children}</main>
          </div>
        </div>

        {/* Sheets mounted once at layout — persist across navigation */}
        <LogSheetMount
          defaultCoolingPeriod={ctx.defaultCoolingPeriod}
          timeCostContext={ctx.timeCostContext}
        />
        <ResolveSheetMount
          coolingItems={coolingForResolve}
          timeCostContext={ctx.timeCostContext}
        />
      </ResolveSheetProvider>
    </LogModalProvider>
  )
}
