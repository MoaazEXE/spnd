import { prisma } from '@/lib/prisma'
import type { ItemStatus } from '@/types'

export const itemsRepo = {
  async findManyByUser(userId: string) {
    return prisma.item.findMany({
      where: { userId },
      orderBy: { coolingUntil: 'asc' },
    })
  },

  async findSkippedByUser(userId: string) {
    return prisma.item.findMany({
      where: { userId, status: 'SKIPPED' },
      orderBy: { resolvedAt: 'desc' },
    })
  },

  async create(data: {
    userId: string
    title: string
    amountCents: number
    coolingUntil: Date
    note?: string
  }) {
    return prisma.item.create({ data })
  },

  async resolve(id: string, userId: string, status: Extract<ItemStatus, 'BOUGHT' | 'SKIPPED'>) {
    return prisma.item.update({
      where: { id, userId },
      data: { status, resolvedAt: new Date() },
    })
  },

  async snooze(id: string, userId: string) {
    const item = await prisma.item.findUniqueOrThrow({
      where: { id, userId },
      select: { coolingUntil: true },
    })
    // Adds 24 h to the existing deadline (not from now)
    const newCoolingUntil = new Date(item.coolingUntil.getTime() + 24 * 60 * 60 * 1000)
    return prisma.item.update({
      where: { id, userId },
      data: { coolingUntil: newCoolingUntil },
    })
  },
}
