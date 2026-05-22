import { prisma } from '@/lib/prisma'
import type { TimeCostMode } from '@/types'

export const usersRepo = {
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } })
  },

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
}
