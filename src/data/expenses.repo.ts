import { prisma } from '@/lib/prisma'

interface ShareInput {
  userId: string
  shareCents: number
}

export const expensesRepo = {
  /**
   * Create an INSTANT-type expense with all member shares in one transaction.
   * Caller computes the per-member shareCents — we just persist them atomically.
   */
  async createInstant(data: {
    groupId: string
    payerId: string
    amountCents: number
    description: string
    shares: ShareInput[]
  }) {
    return prisma.expense.create({
      data: {
        groupId: data.groupId,
        payerId: data.payerId,
        amountCents: data.amountCents,
        description: data.description,
        type: 'INSTANT',
        status: 'COMMITTED',
        shares: {
          create: data.shares.map(s => ({
            userId: s.userId,
            shareCents: s.shareCents,
          })),
        },
      },
      include: { shares: true },
    })
  },

  async findByGroup(groupId: string) {
    return prisma.expense.findMany({
      where: { groupId, status: 'COMMITTED' },
      orderBy: { createdAt: 'desc' },
      include: {
        shares: true,
        guestShares: {
          include: { guest: { select: { addedBy: true } } },
        },
        payer: { select: { id: true, name: true } },
      },
    })
  },

  /**
   * Search expense descriptions across groups the user belongs to.
   * Scopes via Group.members join so users only see their own groups.
   */
  async searchByUser(userId: string, query: string, limit = 6) {
    const q = query.trim()
    if (!q) return []
    return prisma.expense.findMany({
      where: {
        status: 'COMMITTED',
        description: { contains: q, mode: 'insensitive' },
        group: {
          members: { some: { userId, status: 'ACTIVE' } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        description: true,
        amountCents: true,
        createdAt: true,
        group: { select: { id: true, name: true } },
      },
    })
  },
} as const

export type ExpensesRepo = typeof expensesRepo
