// Shared domain types — framework-free, re-exported across layers

export type ItemStatus = 'COOLING' | 'BOUGHT' | 'SKIPPED'
export type ComputedItemStatus = ItemStatus | 'READY_TO_RESOLVE'
export type ExpenseType = 'INSTANT' | 'PROPOSAL'
export type ExpenseStatus = 'COOLING' | 'COMMITTED' | 'CANCELLED'
export type Reaction = 'IN' | 'SKIP'
export type TimeCostMode = 'SIMPLE' | 'TRUE_HOURLY'
export type CoolingUnit = 'HOURS' | 'DAYS' | 'WEEKS'

export interface CoolingPeriod {
  value: number
  unit: CoolingUnit
}

export interface TimeCostInput {
  amountCents: number
  monthlyIncomeCents: number
  workingHoursPerWeek: number
  mode: TimeCostMode
  commuteHours?: number
  workCostsCents?: number
}

export interface TimeCostResult {
  hours: number
  formatted: string
}

export interface Payment {
  from: string
  to: string
  amountCents: number
}
