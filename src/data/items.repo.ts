// Item repository — all Prisma access for cooling-queue items lives here
import { prisma } from '@/lib/prisma'

export const itemsRepo = {
  // Sprint 1: findManyByUser, create, updateStatus, findCooledItems
} as const

export type ItemsRepo = typeof itemsRepo
