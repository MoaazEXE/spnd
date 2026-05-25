import { getUserContext } from '@/lib/user-context'
import { LogSheetMount } from './log-sheet-mount'

/**
 * Server-side wrapper for the log-temptation sheet. Lazy because the sheet
 * is hidden until the FAB / top-bar button is tapped.
 */
export async function LogSheetData() {
  const ctx = await getUserContext()
  if (!ctx) return null
  return (
    <LogSheetMount
      defaultCoolingPeriod={ctx.defaultCoolingPeriod}
      timeCostContext={ctx.timeCostContext}
    />
  )
}
