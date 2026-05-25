import { cache } from 'react'
import { prisma } from '@/lib/prisma'

const groupInclude = {
  members: {
    where: { status: 'ACTIVE' as const },
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
 * Per-request: every group the user has ACTIVELY joined, with members,
 * expenses, shares, and skipped items preloaded. Pending invites live
 * separately — see findPendingInvitesByUser.
 */
const findManyByUserDeepCached = cache(async (userId: string) =>
  prisma.group.findMany({
    where: { members: { some: { userId, status: 'ACTIVE' } } },
    orderBy: { createdAt: 'desc' },
    include: groupInclude,
  }),
)

/** Single group with the same deep shape, gated by ACTIVE membership. */
const findByIdDeepCached = cache(async (id: string, userId: string) => {
  const group = await prisma.group.findUnique({
    where: { id },
    include: groupInclude,
  })
  if (!group) return null
  if (!group.members.some(m => m.userId === userId)) return null
  return group
})

/** Pending invites for the current user — used by the bell + /groups banner. */
const findPendingInvitesByUserCached = cache(async (userId: string) =>
  prisma.groupMember.findMany({
    where: { userId, status: 'PENDING' },
    orderBy: { joinedAt: 'desc' },
    include: {
      group: {
        select: {
          id: true,
          name: true,
          _count: { select: { members: { where: { status: 'ACTIVE' } } } },
        },
      },
    },
  }),
)

export const groupsRepo = {
  findManyByUserDeep: findManyByUserDeepCached,
  findByIdDeep: findByIdDeepCached,
  findPendingInvitesByUser: findPendingInvitesByUserCached,

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
        members: { create: { userId: data.createdBy, status: 'ACTIVE' } },
      },
    })
  },

  async inviteMember(groupId: string, userId: string, invitedBy: string) {
    return prisma.groupMember.upsert({
      where: { groupId_userId: { groupId, userId } },
      create: { groupId, userId, status: 'PENDING', invitedBy },
      update: {}, // existing membership unchanged
    })
  },

  async acceptInvite(groupId: string, userId: string) {
    return prisma.groupMember.update({
      where: { groupId_userId: { groupId, userId } },
      data: { status: 'ACTIVE', joinedAt: new Date() },
    })
  },

  async rejectInvite(groupId: string, userId: string) {
    return prisma.groupMember.delete({
      where: { groupId_userId: { groupId, userId } },
    })
  },

  countByUser: cache(async (userId: string) =>
    prisma.groupMember.count({ where: { userId, status: 'ACTIVE' } }),
  ),

  countPendingInvitesByUser: cache(async (userId: string) =>
    prisma.groupMember.count({ where: { userId, status: 'PENDING' } }),
  ),
} as const

export type GroupsRepo = typeof groupsRepo
export type DeepGroup = Awaited<ReturnType<typeof findManyByUserDeepCached>>[number]
