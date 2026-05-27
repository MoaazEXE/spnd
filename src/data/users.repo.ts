import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { TimeCostMode } from '@/types'

const findByIdCached = cache(async (id: string) =>
  unstable_cache(
    async () => prisma.user.findUnique({ where: { id } }),
    ['users-findById', id],
    { tags: [`user-${id}`] },
  )(),
)

export const usersRepo = {
  findById: findByIdCached,

  async updateIncome(
    id: string,
    data: {
      monthlyIncomeCents: number | null
      workingHoursPerWeek: number | null
      timeCostMode: TimeCostMode
      commuteHours: number | null
      workCostsCents: number | null
    },
  ) {
    return prisma.user.update({ where: { id }, data })
  },

  async updateDefaultCoolingPeriod(id: string, period: string) {
    return prisma.user.update({ where: { id }, data: { defaultCoolingPeriod: period } })
  },

  async updateName(id: string, name: string) {
    return prisma.user.update({ where: { id }, data: { name } })
  },

  async updateProfile(id: string, data: { name: string; avatarUrl?: string }) {
    return prisma.user.update({ where: { id }, data })
  },

  async updateCurrency(id: string, currency: string) {
    return prisma.user.update({ where: { id }, data: { currency } })
  },

  async updateNotificationPrefs(
    id: string,
    prefs: {
      notifyCoolingReady: boolean
      notifyGroupActivity: boolean
      notifyMilestoneUnlocked: boolean
    },
  ) {
    return prisma.user.update({ where: { id }, data: prefs })
  },

  /** Cascade-delete all user data before removing the auth row. */
  async cascadeDeleteUserData(id: string): Promise<void> {
    // Deleting groups cascades their members, expenses, and expense shares
    await prisma.group.deleteMany({ where: { createdBy: id } })
    // Remove any expenses paid by this user in groups they didn't create
    await prisma.expense.deleteMany({ where: { payerId: id } })
    // Remove guests this user added in other people's groups — FK to User has no cascade
    await prisma.guestMember.deleteMany({ where: { addedBy: id } }).catch(() => {})
    // Now the user row can be safely deleted (Items, GroupMember, ExpenseShare cascade)
    await prisma.user.delete({ where: { id } })
  },
}
