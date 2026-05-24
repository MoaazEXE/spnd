import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import type { ItemStatus } from '@/types'

/**
 * Fetches every item for a user once per request and partitions by status.
 * Repo methods below return slices of this single result, so any combination
 * of finders within one request shares the same DB round-trip.
 */
const findAllByUserCached = cache(async (userId: string) => {
  const all = await prisma.item.findMany({
    where: { userId },
    orderBy: [{ status: 'asc' }, { coolingUntil: 'asc' }, { resolvedAt: 'desc' }],
  })
  return {
    all,
    cooling: all
      .filter(i => i.status === 'COOLING')
      .sort((a, b) => a.coolingUntil.getTime() - b.coolingUntil.getTime()),
    skipped: all
      .filter(i => i.status === 'SKIPPED')
      .sort((a, b) => (b.resolvedAt?.getTime() ?? 0) - (a.resolvedAt?.getTime() ?? 0)),
    bought: all
      .filter(i => i.status === 'BOUGHT')
      .sort((a, b) => (b.resolvedAt?.getTime() ?? 0) - (a.resolvedAt?.getTime() ?? 0)),
  }
})

export const itemsRepo = {
  async findManyByUser(userId: string) {
    return (await findAllByUserCached(userId)).all
  },

  async findSkippedByUser(userId: string) {
    return (await findAllByUserCached(userId)).skipped
  },

  async findBoughtByUser(userId: string) {
    return (await findAllByUserCached(userId)).bought
  },

  async findCoolingByUser(userId: string) {
    return (await findAllByUserCached(userId)).cooling
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

  async updateResolved(id: string, userId: string, data: { amountCents: number; status: 'BOUGHT' | 'SKIPPED' }) {
    return prisma.item.update({ where: { id, userId }, data })
  },

  async resolve(id: string, userId: string, status: Extract<ItemStatus, 'BOUGHT' | 'SKIPPED'>) {
    return prisma.item.update({
      where: { id, userId },
      data: { status, resolvedAt: new Date() },
    })
  },

  async searchByUser(userId: string, query: string, limit = 10) {
    const q = query.trim()
    if (!q) return []
    return prisma.item.findMany({
      where: {
        userId,
        title: { contains: q, mode: 'insensitive' },
      },
      orderBy: [{ resolvedAt: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    })
  },

  async snooze(id: string, userId: string) {
    const item = await prisma.item.findUniqueOrThrow({
      where: { id, userId },
      select: { coolingUntil: true },
    })
    const newCoolingUntil = new Date(item.coolingUntil.getTime() + 24 * 60 * 60 * 1000)
    return prisma.item.update({
      where: { id, userId },
      data: { coolingUntil: newCoolingUntil },
    })
  },
}
