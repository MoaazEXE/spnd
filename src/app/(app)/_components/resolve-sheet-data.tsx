import { itemsRepo } from '@/data/items.repo'
import { getUserContext } from '@/lib/user-context'
import { ResolveSheetMount } from './resolve-sheet-mount'

/**
 * Server-side wrapper that fetches the cooling list shaped for the resolve
 * sheet. The sheet itself is invisible until the user opens it, so this can
 * stream in lazily without affecting first paint.
 */
export async function ResolveSheetData() {
  const ctx = await getUserContext()
  if (!ctx) return null

  const items = await itemsRepo.findCoolingForResolveByUser(ctx.id)

  return (
    <ResolveSheetMount
      coolingItems={items}
      timeCostContext={ctx.timeCostContext}
    />
  )
}
