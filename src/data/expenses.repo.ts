// Expense repository — instant splits, cooling proposals, shares, and reactions
import { prisma } from '@/lib/prisma'

export const expensesRepo = {
  // Sprint 2: create, findByGroup, upsertShare, findSharesByExpense
} as const

export type ExpensesRepo = typeof expensesRepo
