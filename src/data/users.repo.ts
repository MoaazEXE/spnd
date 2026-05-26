import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import type { TimeCostMode } from '@/types'

const findByIdCached = cache(async (id: string) =>
  prisma.user.findUnique({ where: { id } }),
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
}
