# Settle — Outstanding Improvements

Backlog from the 2026-05-25 audit. Top five (realtime sync, confirm dialog,
component split, error banners, ownership transfer) are already done. The
rest live here in roughly impact order.

## 6. Suspense the dashboard

Why: hero numbers + greeting block on a single `await` for items + groups
before any pixel paints. With Suspense + streaming we can render the shell
immediately, then stream in cooling/groups/recent-wins as they resolve.

Plan:
- Wrap `<HeroSavings />`, `<CoolingNowSection />`, `<RecentWins />`,
  `<GroupsMiniList />` each in `<Suspense fallback={…}>`.
- Move their data fetching into per-section async server components.
- Each component reuses `groupsRepo.findManyByUserDeep` and
  `itemsRepo.findAllByUserCached` via `react/cache` — no extra queries.

Effort: ~half-day. Tooltip: confirm `groupRows` and `recent wins` truly
benefit, since the deep query is already one trip.

## 7. Accessibility polish

- Focus-trap inside `SheetFrame` so Tab cycles within the sheet.
- `Esc` to close `SheetFrame` (currently only `ConfirmDialog` listens).
- `aria-live="polite"` on the toast container so screen readers
  announce success/error toasts.
- Audit icon-only buttons for `aria-label` (most are good — search the
  `<button>` tags in `top-bar.tsx`, `cooling-card.tsx`, group rows).
- Add `:focus-visible` styles to the new ConfirmDialog buttons.

Effort: ~half-day.

## 8. Search ranking

Right now `itemsRepo.searchByUser` orders by `resolvedAt desc, createdAt
desc`. Improve to:
- Exact title match → highest.
- Title startsWith → next.
- `contains` (current) → fallback.
- Within tier, cooling items above resolved (active context wins).

Also bump the limit when only one category has matches.

Implementation: in `itemsRepo.searchByUser`, fetch a slightly larger pool
and rank in memory — Prisma's order-by can't express the ranking cleanly.

## 9. Group expense descriptions in search

Wire `expensesRepo` into `/api/search`:
- New repo method `searchExpensesByUser(userId, q, limit)` joining
  Expense → Group → GroupMember.userId === userId, filter
  `description contains q`, return `{ id, description, groupId, groupName,
  amountCents }`.
- Add an "Expenses" section to the search palette below Items.
- Selecting an expense routes to `/groups/[id]` (the activity row will be
  visible after the realtime refresh).

## 10. Prisma migrations

Currently using `db push` style — fast but no history. Before another dev
joins:
- `npx prisma migrate diff --from-empty --to-schema-datamodel
  prisma/schema.prisma --script > prisma/migrations/00000000_init/migration.sql`
- Then `prisma migrate resolve --applied 00000000_init`
- From there, every schema change → `prisma migrate dev --name xxx`.

## 11. Observability

API routes (`/api/search`) and server actions silently fail. Even minimal:

```ts
try { … } catch (err) {
  console.error('[search]', { userId, q, err })
  throw err
}
```

Better: a tiny `logError(scope, ctx, err)` helper that adds a request id
(read from `headers().get('x-vercel-id')` on Vercel) and serializes to
JSON one line. Pipe to Vercel Logs or Sentry from there.

## 12. Tablet (768–1023px) breakpoint pass

The handoff calls for icon-only sidebar or hamburger drawer here. Today
the sidebar disappears below `lg` (1024px) and the bottom tab bar takes
over, which leaves 768–1023px without the right polish.

Plan:
- Make the sidebar's `hidden lg:flex` → `hidden md:flex`, with an
  `md:w-16 lg:w-60` collapse — icons only on tablet.
- Hide the mobile bottom tab bar at `md+`.
- Hide the mobile FAB at `md+` too (the top-bar button takes over).
- Hero number: scale from 96px → 64px at `md`.

## 13. Cooling proposals + reactions + realtime votes (Day 7 work)

This was in the original spec; never built. Schema already has
`Expense.type = 'PROPOSAL' | 'INSTANT'`, `ExpenseStatus.COOLING`,
`ExpenseShare.reaction`. To finish:
- `proposeExpense` action creates an Expense with `type=PROPOSAL,
  status=COOLING, coolingUntil=...`.
- Each share row's `reaction` gets set via a `reactToProposal` action.
- When proposal expires (server-side timer or on-read check), if
  majority reaction is `SKIP`, mark as CANCELLED + create a SKIPPED Item
  linked to the group (so it contributes to "saved together"). Otherwise
  promote to COMMITTED.
- Group detail's Cooling tab renders proposals via `GroupProposalCard`
  matching the handoff design.
- Realtime channel already covers `Expense` + `ExpenseShare`, so live
  vote updates come for free.

## 14. Settle page sticky-bar collides with mobile FAB

On `/groups/[id]/settle` and `/resplit`, the sticky "Mark as paid" /
"Apply re-split" bar sits at `bottom-[60px]` (above the tab bar). The
new FAB at `bottom-[78px]` overlaps it visually on the group detail —
but those pages don't render the FAB (it's mounted in the layout). Audit
which routes show the FAB and decide if it should hide on settle/resplit.

Quickest fix: `LogFab` reads `usePathname()` and returns null on
`/groups/*/settle` and `/groups/*/resplit`.

## 15. Cooling card: keep the per-card render lightweight

`CoolingCard` now uses the shared `useTick` hook, but every tick triggers
a full re-render of every card. For 10+ cards on screen this is fine;
beyond that, consider:

- Move the countdown text to a small leaf component (`<Countdown until={…}/>`)
  that subscribes to the tick — siblings don't re-render.
- Or, throttle to 30s for items more than 1 hour from ready, 1s when
  under 60s remaining.

## 16. Bundle audit

Quick wins likely:
- Lucide icons are imported individually (`from 'lucide-react'`) which
  is tree-shakeable in dev but verify in production build.
- `cmdk` is ~7KB gzipped — already loaded only via SearchPalette mount.
- Sonner is ~12KB — used everywhere, can't avoid.
- Confirm Recharts isn't pulled in if we're not using it (check `bundle
  analyze` output).

Run `next build` and inspect `.next/analyze/` or use
`@next/bundle-analyzer`.

## 17. Connection pooling

Verify `DATABASE_URL` uses the pooled Supabase URL (port 6543, pgbouncer
transaction mode) and `DIRECT_URL` uses the direct connection (port 5432)
for migrations. On Vercel serverless, the pooled URL is critical — without
it, cold starts open new TCP connections every time.

## 18. Item search ranking by recency × frequency

When the same user logs the same item title repeatedly (e.g. "Coffee"),
prioritize that in search. Cheap implementation: add a count subquery
and order by it. Even cheaper: just sort by `MAX(createdAt)` for matching
title, descending.

---

**Done in this batch (audit top 5):**
1. ✅ Realtime sync for groups → `src/lib/use-group-realtime.ts`,
   mounted in `GroupDetailShell`.
2. ✅ `ConfirmDialog` primitive → `src/components/ui/confirm-dialog.tsx`,
   wired into Leave/Delete group and Delete activity.
3. ✅ Split `group-detail-shell` → `activity-list.tsx`, `members-list.tsx`,
   `danger-zone.tsx`, `transfer-ownership-sheet.tsx`. Shell is back under
   220 lines.
4. ✅ Error toasts on destructive actions (leave, delete, delete-activity,
   settle, transfer).
5. ✅ Owner transfer → new `transferOwnership` server action + sheet.

**Done in the speed pass:**
- DB indexes on Item, Group, Expense, ExpenseShare for every hot WHERE clause.
- Dropped Prisma `query` log in dev (was emitting dozens of lines per nav).
- `summarizeSkipped()` folds 5 walks into one for the dashboard.
- `useTick()` shares one timer per interval across CoolingCards and the bell.
