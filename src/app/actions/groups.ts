'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/supabase/server'
import { ensureUserRecord } from '@/lib/ensure-user'
import { groupsRepo } from '@/data/groups.repo'
import { expensesRepo } from '@/data/expenses.repo'
import { equalSplit, settlementPlan } from '@/core/debt/groupBalances'
import {
  getRequiredString,
  getRequiredCents,
  ValidationError,
  withValidation,
} from '@/lib/form-data'

async function getAuthUserId(): Promise<string> {
  const user = await getCurrentUser()
  if (!user) throw new ValidationError('Unauthorized')
  await ensureUserRecord(user)
  return user.id
}

async function requireMembership(groupId: string, userId: string): Promise<void> {
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  })
  if (!member) throw new ValidationError("You're not a member of this group.")
}

export async function createGroup(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  let newId: string | null = null
  const result = await withValidation(async () => {
    const name = getRequiredString(formData, 'name')
    if (name.length > 60) throw new ValidationError('Group name is too long.')
    const userId = await getAuthUserId()
    const group = await groupsRepo.create({ name, createdBy: userId })
    newId = group.id
  })

  if (typeof result === 'string') return result
  revalidatePath('/groups')
  if (newId) redirect(`/groups/${newId}`)
  return null
}

export async function addMemberByEmail(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const result = await withValidation(async () => {
    const groupId = getRequiredString(formData, 'groupId')
    const email = getRequiredString(formData, 'email').toLowerCase()
    const userId = await getAuthUserId()
    await requireMembership(groupId, userId)

    const invitee = await prisma.user.findUnique({ where: { email } })
    if (!invitee) {
      throw new ValidationError(
        "We can't find anyone with that email yet. Ask them to sign up first.",
      )
    }
    if (invitee.id === userId) {
      throw new ValidationError("You're already in this group.")
    }
    await groupsRepo.addMember(groupId, invitee.id)
  })

  if (typeof result === 'string') return result
  const groupId = formData.get('groupId')
  if (typeof groupId === 'string') revalidatePath(`/groups/${groupId}`)
  revalidatePath('/groups')
  return null
}

export async function addExpense(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const result = await withValidation(async () => {
    const groupId = getRequiredString(formData, 'groupId')
    const description = getRequiredString(formData, 'description')
    const amountCents = getRequiredCents(formData, 'amount')
    const userId = await getAuthUserId()
    await requireMembership(groupId, userId)

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { members: { select: { userId: true } } },
    })
    if (!group) throw new ValidationError('Group not found.')

    const memberIds = group.members.map(m => m.userId)
    const shares = equalSplit(amountCents, memberIds, userId)

    await expensesRepo.createInstant({
      groupId,
      payerId: userId,
      amountCents,
      description,
      shares,
    })
  })

  if (typeof result === 'string') return result
  const groupId = formData.get('groupId')
  if (typeof groupId === 'string') revalidatePath(`/groups/${groupId}`)
  return null
}

async function requireExpenseAccess(expenseId: string, userId: string) {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: { group: { include: { members: { select: { userId: true } } } } },
  })
  if (!expense) throw new ValidationError('Activity not found.')
  if (!expense.group.members.some(m => m.userId === userId)) {
    throw new ValidationError("You're not a member of this group.")
  }
  return expense
}

export async function editExpense(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  let groupIdForRevalidate: string | null = null
  const result = await withValidation(async () => {
    const expenseId = getRequiredString(formData, 'expenseId')
    const description = getRequiredString(formData, 'description')
    const amountCents = getRequiredCents(formData, 'amount')
    const resplit = formData.get('resplit') === '1'

    const userId = await getAuthUserId()
    const expense = await requireExpenseAccess(expenseId, userId)
    groupIdForRevalidate = expense.groupId

    if (resplit) {
      const memberIds = expense.group.members.map(m => m.userId)
      const shares = equalSplit(amountCents, memberIds, expense.payerId)
      await prisma.$transaction([
        prisma.expenseShare.deleteMany({ where: { expenseId } }),
        prisma.expense.update({
          where: { id: expenseId },
          data: {
            description,
            amountCents,
            shares: { create: shares },
          },
        }),
      ])
    } else {
      // Preserve the original share *ratio* against the new amount.
      const original = await prisma.expenseShare.findMany({ where: { expenseId } })
      const oldTotal = original.reduce((sum, s) => sum + s.shareCents, 0)
      if (oldTotal === 0) {
        throw new ValidationError('Activity has no shares to scale — re-split instead.')
      }
      let allocated = 0
      const scaled = original.map((s, i) => {
        const isLast = i === original.length - 1
        const share = isLast
          ? amountCents - allocated
          : Math.round((s.shareCents / oldTotal) * amountCents)
        allocated += share
        return { id: s.id, shareCents: share }
      })
      await prisma.$transaction([
        prisma.expense.update({
          where: { id: expenseId },
          data: { description, amountCents },
        }),
        ...scaled.map(s =>
          prisma.expenseShare.update({
            where: { id: s.id },
            data: { shareCents: s.shareCents },
          }),
        ),
      ])
    }
  })

  if (typeof result === 'string') return result
  if (groupIdForRevalidate) revalidatePath(`/groups/${groupIdForRevalidate}`)
  revalidatePath('/groups')
  return null
}

export async function deleteExpense(formData: FormData): Promise<void> {
  const expenseId = getRequiredString(formData, 'expenseId')
  const userId = await getAuthUserId()
  const expense = await requireExpenseAccess(expenseId, userId)
  await prisma.expense.delete({ where: { id: expenseId } })
  revalidatePath(`/groups/${expense.groupId}`)
  revalidatePath('/groups')
}

export async function resplitExpense(formData: FormData): Promise<void> {
  const expenseId = getRequiredString(formData, 'expenseId')
  const userId = await getAuthUserId()
  const expense = await requireExpenseAccess(expenseId, userId)

  const memberIds = expense.group.members.map(m => m.userId)
  const shares = equalSplit(expense.amountCents, memberIds, expense.payerId)
  await prisma.$transaction([
    prisma.expenseShare.deleteMany({ where: { expenseId } }),
    prisma.expense.update({
      where: { id: expenseId },
      data: { shares: { create: shares } },
    }),
  ])
  revalidatePath(`/groups/${expense.groupId}`)
}

export async function resplitAll(formData: FormData): Promise<void> {
  const groupId = getRequiredString(formData, 'groupId')
  const userId = await getAuthUserId()
  await requireMembership(groupId, userId)

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: { select: { userId: true } },
      expenses: {
        where: { status: 'COMMITTED', NOT: { description: 'Settlement' } },
        select: { id: true, amountCents: true, payerId: true },
      },
    },
  })
  if (!group) throw new ValidationError('Group not found.')

  const memberIds = group.members.map(m => m.userId)

  await prisma.$transaction(
    group.expenses.flatMap(e => {
      const shares = equalSplit(e.amountCents, memberIds, e.payerId)
      return [
        prisma.expenseShare.deleteMany({ where: { expenseId: e.id } }),
        prisma.expense.update({
          where: { id: e.id },
          data: { shares: { create: shares } },
        }),
      ]
    }),
  )

  revalidatePath(`/groups/${groupId}`)
  revalidatePath('/groups')
  redirect(`/groups/${groupId}`)
}

export async function settleGroup(formData: FormData): Promise<void> {
  const groupId = getRequiredString(formData, 'groupId')
  const userId = await getAuthUserId()
  await requireMembership(groupId, userId)

  const expenses = await expensesRepo.findByGroup(groupId)
  const plan = settlementPlan(expenses)
  if (plan.length === 0) return

  // Record each simplified payment as an Expense — the resulting share offsets
  // exactly cancel the original debts, so subsequent balances read as zero.
  await prisma.$transaction(
    plan.map(p =>
      prisma.expense.create({
        data: {
          groupId,
          payerId: p.from,
          amountCents: p.amountCents,
          description: 'Settlement',
          type: 'INSTANT',
          status: 'COMMITTED',
          shares: { create: { userId: p.to, shareCents: p.amountCents } },
        },
      }),
    ),
  )

  revalidatePath(`/groups/${groupId}`)
  revalidatePath('/groups')
  redirect(`/groups/${groupId}`)
}
