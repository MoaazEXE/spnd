// Time-cost engine — converts a price into hours of the user's life (§8.3)
import type { TimeCostInput, TimeCostResult } from '@/types'

const WEEKS_PER_MONTH = 365.25 / 12 / 7

export function calculateTimeCost(input: TimeCostInput): TimeCostResult {
  const { amountCents, monthlyIncomeCents, workingHoursPerWeek, mode } = input
  const monthlyWorkHours = workingHoursPerWeek * WEEKS_PER_MONTH

  let hourlyRateCents: number
  if (mode === 'SIMPLE') {
    hourlyRateCents = monthlyIncomeCents / monthlyWorkHours
  } else {
    const commutePerMonth = (input.commuteHours ?? 0) * WEEKS_PER_MONTH * 5 // 5 workdays
    const effectiveHours  = monthlyWorkHours + commutePerMonth
    const effectiveIncome = monthlyIncomeCents - (input.workCostsCents ?? 0)
    hourlyRateCents = effectiveHours > 0 ? effectiveIncome / effectiveHours : 0
  }

  if (hourlyRateCents <= 0) return { hours: 0, formatted: '0 min' }

  const hours = amountCents / hourlyRateCents
  return { hours, formatted: formatHours(hours) }
}

function formatHours(hours: number): string {
  if (hours < 1 / 60) return '< 1 min'
  if (hours < 1) {
    const minutes = Math.round(hours * 60)
    return `${minutes} min`
  }
  if (hours >= 24) {
    const days = hours / 24
    const daysStr = days.toFixed(1).replace(/\.0$/, '')
    const label = daysStr === '1' ? 'day' : 'days'
    return `${daysStr} ${label} (${Math.round(hours)}h)`
  }
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return m === 0 ? `${h}h` : `${h}h ${m}min`
}
