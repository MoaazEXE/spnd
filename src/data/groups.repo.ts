import { cache } from 'react'
import { prisma } from '@/lib/prisma'

const groupInclude = {
  members: {
    orderBy: { joinedAt: 'asc' as const },
    include: { user: { select: { id: true, name: true, email: true } } },
  },
  expenses: {
    where: { status: 'COMMITTED' as const },
    orderBy: { createdAt: 'desc' as const },
    include: {
      shares: true,
      payer: { select: { id: true, name: true } },
    },
  },
  items: {
    where: { status: 'SKIPPED' as const },
    select: { amountCents: true },
  },
}

/**
 * Per-request: every group the user belongs to, with members, expenses,
 * shares, and skipped items preloaded. Shared by /groups, dashboard
 * mini-list, and layout count — one trip instead of N+1.
 */
const findManyByUserDeepCached = cache(async (userId: string) =>
  prisma.group.findMany({
    where: { members: { some: { userId } } },
    orderBy: { createdAt: 'desc' },
    include: groupInclude,
  }),
)

/** Single group with the same deep shape, gated by membership. */
const findByIdDeepCached = cache(async (id: string, userId: string) => {
  const group = await prisma.group.findUnique({
    where: { id },
    include: groupInclude,
  })
  if (!group) return null
  if (!group.members.some(m => m.userId === userId)) return null
  return group
})

export const groupsRepo = {
  findManyByUserDeep: findManyByUserDeepCached,
  findByIdDeep: findByIdDeepCached,

  async findManyByUser(userId: string) {
    return findManyByUserDeepCached(userId)
  },

  async findById(id: string, userId: string) {
    return findByIdDeepCached(id, userId)
  },

  async create(data: { name: string; createdBy: string }) {
    return prisma.group.create({
      data: {
        name: data.name,
        createdBy: data.createdBy,
        members: { create: { userId: data.createdBy } },
      },
    })
  },

  async addMember(groupId: string, userId: string) {
    return prisma.groupMember.upsert({
      where: { groupId_userId: { groupId, userId } },
      create: { groupId, userId },
      update: {},
    })
  },

  countByUser: cache(async (userId: string) =>
    prisma.groupMember.count({ where: { userId } }),
  ),
} as const

export type GroupsRepo = typeof groupsRepo
export type DeepGroup = Awaited<ReturnType<typeof findManyByUserDeepCached>>[number]
