'use server'

import { redirect } from 'next/navigation'
import { updateTag } from 'next/cache'
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

async function requireActiveMembership(groupId: string, userId: string): Promise<void> {
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  })
  if (!member || member.status !== 'ACTIVE') {
    throw new ValidationError("You're not a member of this group.")
  }
}

/**
 * Invalidates cached data for every active member of a group plus the group's
 * own tag. Call this after any mutation that changes group content so all
 * members (including non-acting ones whose realtime refresh fires) get fresh data.
 */
async function revalidateGroupMembers(groupId: string, extraUserId?: string) {
  const members = await prisma.groupMember.findMany({
    where: { groupId, status: 'ACTIVE' },
    select: { userId: true },
  })
  for (const { userId } of members) {
    updateTag(`groups-user-${userId}`)
  }
  // Cover the acting user if they're no longer an active member (e.g. after leave/reject)
  if (extraUserId && !members.some(m => m.userId === extraUserId)) {
    updateTag(`groups-user-${extraUserId}`)
  }
  updateTag(`group-${groupId}`)
}

export async function createGroup(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  let userId: string | null = null
  let newId: string | null = null
  const result = await withValidation(async () => {
    const name = getRequiredString(formData, 'name')
    if (name.length > 60) throw new ValidationError('Group name is too long.')
    userId = await getAuthUserId()
    const group = await groupsRepo.create({ name, createdBy: userId })
    newId = group.id
  }, 'action:createGroup')

  if (typeof result === 'string') return result
  if (userId) updateTag(`groups-user-${userId}`)
  if (newId) redirect(`/groups/${newId}`)
  return null
}

export async function inviteMemberByEmail(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  let inviteeId: string | null = null
  let actingUserId: string | null = null
  const result = await withValidation(async () => {
    const groupId = getRequiredString(formData, 'groupId')
    const email = getRequiredString(formData, 'email').toLowerCase()
    actingUserId = await getAuthUserId()
    await requireActiveMembership(groupId, actingUserId)

    const invitee = await prisma.user.findUnique({ where: { email } })
    if (!invitee) {
      throw new ValidationError(
        "We can't find anyone with that email yet. Ask them to sign up first.",
      )
    }
    if (invitee.id === actingUserId) {
      throw new ValidationError("You're already in this group.")
    }

    const existing = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: invitee.id } },
    })
    if (existing?.status === 'ACTIVE') {
      throw new ValidationError("They're already in this group.")
    }
    if (existing?.status === 'PENDING') {
      throw new ValidationError("They already have a pending invite.")
    }

    inviteeId = invitee.id
    await groupsRepo.inviteMember(groupId, invitee.id, actingUserId)
  })

  if (typeof result === 'string') return result
  const groupId = formData.get('groupId') as string
  // Invitee sees the new pending invite; existing members see updated member count
  if (inviteeId) updateTag(`groups-user-${inviteeId}`)
  updateTag(`group-${groupId}`)
  return null
}

export async function acceptInvite(formData: FormData): Promise<void> {
  const groupId = getRequiredString(formData, 'groupId')
  const userId = await getAuthUserId()
  const invite = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  })
  if (!invite || invite.status !== 'PENDING') {
    throw new ValidationError('No pending invite for this group.')
  }
  await groupsRepo.acceptInvite(groupId, userId)
  // Revalidate all members (new member joins — everyone's group data changes)
  await revalidateGroupMembers(groupId, userId)
}

export async function transferOwnership(formData: FormData): Promise<void> {
  const groupId = getRequiredString(formData, 'groupId')
  const newOwnerId = getRequiredString(formData, 'newOwnerId')
  const userId = await getAuthUserId()

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: { where: { status: 'ACTIVE' }, select: { userId: true } } },
  })
  if (!group) throw new ValidationError('Group not found.')
  if (group.createdBy !== userId) {
    throw new ValidationError('Only the creator can transfer ownership.')
  }
  if (newOwnerId === userId) {
    throw new ValidationError("You're already the owner.")
  }
  if (!group.members.some(m => m.userId === newOwnerId)) {
    throw new ValidationError('Pick an active member of this group.')
  }

  await prisma.group.update({
    where: { id: groupId },
    data: { createdBy: newOwnerId },
  })

  await revalidateGroupMembers(groupId)
}

export async function kickMember(formData: FormData): Promise<void> {
  const groupId = getRequiredString(formData, 'groupId')
  const memberId = getRequiredString(formData, 'memberId')
  const userId = await getAuthUserId()

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { createdBy: true },
  })
  if (!group) throw new ValidationError('Group not found.')
  if (group.createdBy !== userId) throw new ValidationError('Only the owner can remove members.')
  if (memberId === userId) throw new ValidationError('You cannot remove yourself.')
  if (memberId === group.createdBy) throw new ValidationError('Cannot remove the group owner.')

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: memberId } },
  })
  if (!member || member.status !== 'ACTIVE') throw new ValidationError('Member not found.')

  await prisma.groupMember.delete({
    where: { groupId_userId: { groupId, userId: memberId } },
  })

  updateTag(`groups-user-${memberId}`)
  await revalidateGroupMembers(groupId, memberId)
}

export async function leaveGroup(formData: FormData): Promise<void> {
  const groupId = getRequiredString(formData, 'groupId')
  const userId = await getAuthUserId()
  await requireActiveMembership(groupId, userId)

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { createdBy: true },
  })
  if (!group) throw new ValidationError('Group not found.')
  if (group.createdBy === userId) {
    throw new ValidationError(
      "You're the creator — delete the group instead, or transfer it first.",
    )
  }

  // Capture remaining members before removal so we can revalidate them
  const remainingMembers = await prisma.groupMember.findMany({
    where: { groupId, status: 'ACTIVE', NOT: { userId } },
    select: { userId: true },
  })

  await prisma.groupMember.delete({
    where: { groupId_userId: { groupId, userId } },
  })

  // Revalidate leaving user + remaining members
  updateTag(`groups-user-${userId}`)
  for (const { userId: memberId } of remainingMembers) {
    updateTag(`groups-user-${memberId}`)
  }
  updateTag(`group-${groupId}`)
  redirect('/groups')
}

export async function deleteGroup(formData: FormData): Promise<void> {
  const groupId = getRequiredString(formData, 'groupId')
  const userId = await getAuthUserId()
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { createdBy: true },
  })
  if (!group) throw new ValidationError('Group not found.')
  if (group.createdBy !== userId) {
    throw new ValidationError('Only the creator can delete a group.')
  }

  // Capture all members before the cascade delete removes them
  const members = await prisma.groupMember.findMany({
    where: { groupId, status: 'ACTIVE' },
    select: { userId: true },
  })

  // Cascades drop members, expenses, shares. Items lose their groupId
  // (onDelete: SetNull) so personal cooling history survives.
  await prisma.group.delete({ where: { id: groupId } })

  for (const { userId: memberId } of members) {
    updateTag(`groups-user-${memberId}`)
  }
  updateTag(`group-${groupId}`)
  redirect('/groups')
}

export async function rejectInvite(formData: FormData): Promise<void> {
  const groupId = getRequiredString(formData, 'groupId')
  const userId = await getAuthUserId()
  const invite = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  })
  if (!invite || invite.status !== 'PENDING') return
  await groupsRepo.rejectInvite(groupId, userId)
  updateTag(`groups-user-${userId}`)
}

function parseParticipants(formData: FormData): string[] {
  const all = formData.getAll('participants')
  return all
    .filter((v): v is string => typeof v === 'string' && v.length > 0)
    .filter((v, i, arr) => arr.indexOf(v) === i)
}

function parseGuestParticipants(formData: FormData): string[] {
  const all = formData.getAll('guestParticipants')
  return all
    .filter((v): v is string => typeof v === 'string' && v.length > 0)
    .filter((v, i, arr) => arr.indexOf(v) === i)
}

export async function addGuestMember(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  let userId: string | null = null
  const result = await withValidation(async () => {
    const groupId = getRequiredString(formData, 'groupId')
    const name = getRequiredString(formData, 'guestName')
    if (name.length > 60) throw new ValidationError('Name is too long.')
    userId = await getAuthUserId()
    await requireActiveMembership(groupId, userId)
    await groupsRepo.addGuestMember(groupId, name, userId)
    await revalidateGroupMembers(groupId)
  }, 'action:addGuestMember')
  return typeof result === 'string' ? result : null
}

export async function removeGuestMember(formData: FormData): Promise<void> {
  const guestId = getRequiredString(formData, 'guestId')
  const userId = await getAuthUserId()
  try {
    await groupsRepo.removeGuestMember(guestId, userId)
    // Revalidate via the guest's group
    const guest = await prisma.guestMember.findUnique({ where: { id: guestId } }).catch(() => null)
    if (guest) await revalidateGroupMembers(guest.groupId)
  } catch (e) {
    if (e instanceof ValidationError) throw e
  }
}

export async function addExpense(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  let groupId: string | null = null
  const result = await withValidation(async () => {
    groupId = getRequiredString(formData, 'groupId')
    const description = getRequiredString(formData, 'description')
    const amountCents = getRequiredCents(formData, 'amount')
    const userId = await getAuthUserId()
    await requireActiveMembership(groupId, userId)

    const rawPayerId = formData.get('payerId') as string | null
    const rawGuestPayerId = formData.get('guestPayerId') as string | null

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: { where: { status: 'ACTIVE' }, select: { userId: true } },
        guestMembers: { select: { id: true, addedBy: true } },
      },
    })
    if (!group) throw new ValidationError('Group not found.')

    const activeIds = new Set(group.members.map(m => m.userId))
    const guestIds = new Set(group.guestMembers.map(g => g.id))

    let payerId: string
    if (rawGuestPayerId && rawGuestPayerId.trim()) {
      if (!guestIds.has(rawGuestPayerId)) throw new ValidationError('Selected guest payer is not in this group.')
      const guest = group.guestMembers.find(g => g.id === rawGuestPayerId)
      if (!guest) throw new ValidationError('Guest not found.')
      payerId = guest.addedBy
    } else {
      payerId = rawPayerId && rawPayerId.trim() ? rawPayerId : userId
      if (!activeIds.has(payerId)) throw new ValidationError('Selected payer is not an active group member.')
    }

    const requested = parseParticipants(formData)
    const participants = requested.length > 0 ? requested : Array.from(activeIds)
    const requestedGuests = parseGuestParticipants(formData)

    for (const id of participants) {
      if (!activeIds.has(id)) throw new ValidationError('One of the selected people is not a group member.')
    }
    for (const id of requestedGuests) {
      if (!guestIds.has(id)) throw new ValidationError('One of the selected guests is not in this group.')
    }
    if (participants.length === 0 && requestedGuests.length === 0) {
      throw new ValidationError('Pick at least one person to split this with.')
    }

    // Equal split across members + guests; remainder to payer
    const totalPeople = participants.length + requestedGuests.length
    const base = Math.floor(amountCents / totalPeople)
    const remainder = amountCents - base * totalPeople
    const shares = participants.map(uid => ({
      userId: uid,
      shareCents: uid === payerId ? base + remainder : base,
    }))
    const guestShares = requestedGuests.map(gid => ({ guestId: gid, shareCents: base }))

    await prisma.expense.create({
      data: {
        groupId,
        payerId: payerId,
        amountCents,
        description,
        type: 'INSTANT',
        status: 'COMMITTED',
        shares: { create: shares },
        guestShares: { create: guestShares },
      },
    })
  })

  if (typeof result === 'string') return result
  if (groupId) await revalidateGroupMembers(groupId)
  return null
}

async function requireExpenseAccess(expenseId: string, userId: string) {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: {
      group: {
        include: {
          members: {
            where: { status: 'ACTIVE' },
            select: { userId: true },
          },
        },
      },
    },
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
      const customMemberIds = formData.getAll('resplitParticipants')
        .filter((v): v is string => typeof v === 'string' && v.length > 0)
      const customGuestIds = formData.getAll('resplitGuestParticipants')
        .filter((v): v is string => typeof v === 'string' && v.length > 0)

      let memberIds: string[]
      let guestIds: string[]

      if (customMemberIds.length > 0 || customGuestIds.length > 0) {
        memberIds = customMemberIds
        guestIds = customGuestIds
      } else {
        memberIds = expense.group.members.map(m => m.userId)
        const groupGuests = await prisma.guestMember.findMany({
          where: { groupId: expense.groupId },
          select: { id: true },
        })
        guestIds = groupGuests.map(g => g.id)
      }

      const totalPeople = memberIds.length + guestIds.length
      if (totalPeople === 0) throw new ValidationError('Pick at least one person to split with.')

      const base = Math.floor(amountCents / totalPeople)
      const remainder = amountCents - base * totalPeople
      const memberShares = memberIds.map(uid => ({
        userId: uid,
        shareCents: uid === expense.payerId ? base + remainder : base,
      }))
      const guestSharesData = guestIds.map(gid => ({ guestId: gid, shareCents: base }))

      await prisma.$transaction([
        prisma.expenseShare.deleteMany({ where: { expenseId } }),
        prisma.guestExpenseShare.deleteMany({ where: { expenseId } }),
        prisma.expense.update({
          where: { id: expenseId },
          data: {
            description,
            amountCents,
            shares: { create: memberShares },
            guestShares: { create: guestSharesData },
          },
        }),
      ])
    } else {
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
  if (groupIdForRevalidate) await revalidateGroupMembers(groupIdForRevalidate)
  return null
}

export async function deleteExpense(formData: FormData): Promise<void> {
  const expenseId = getRequiredString(formData, 'expenseId')
  const userId = await getAuthUserId()
  const expense = await requireExpenseAccess(expenseId, userId)
  await prisma.expense.delete({ where: { id: expenseId } })
  await revalidateGroupMembers(expense.groupId)
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
  await revalidateGroupMembers(expense.groupId)
}

export async function proposeGroupCooling(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  let groupId: string | null = null
  const result = await withValidation(async () => {
    groupId = getRequiredString(formData, 'groupId')
    const description = getRequiredString(formData, 'description')
    const amountCents = getRequiredCents(formData, 'amount')
    const coolingDays = Math.max(1, Math.min(90, parseInt(formData.get('coolingDays') as string || '3', 10)))
    const userId = await getAuthUserId()
    await requireActiveMembership(groupId, userId)

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { members: { where: { status: 'ACTIVE' }, select: { userId: true } } },
    })
    if (!group) throw new ValidationError('Group not found.')

    const coolingUntil = new Date(Date.now() + coolingDays * 24 * 60 * 60 * 1000)
    const memberIds = group.members.map(m => m.userId)
    const shares = equalSplit(amountCents, memberIds, userId)

    await prisma.expense.create({
      data: {
        groupId,
        payerId: userId,
        amountCents,
        description,
        type: 'PROPOSAL',
        status: 'COOLING',
        coolingUntil,
        shares: { create: shares },
      },
    })
  }, 'action:proposeGroupCooling')

  if (typeof result === 'string') return result
  if (groupId) await revalidateGroupMembers(groupId)
  return null
}

export async function reactToProposal(formData: FormData): Promise<void> {
  const expenseId = getRequiredString(formData, 'expenseId')
  const rawReaction = formData.get('reaction') as string
  if (rawReaction !== 'IN' && rawReaction !== 'SKIP') {
    throw new ValidationError('Invalid reaction.')
  }
  const userId = await getAuthUserId()

  const share = await prisma.expenseShare.findFirst({
    where: { expenseId, userId },
    include: { expense: { select: { groupId: true, type: true, status: true } } },
  })
  if (!share) throw new ValidationError('You are not part of this proposal.')
  if (share.expense.type !== 'PROPOSAL' || share.expense.status !== 'COOLING') {
    throw new ValidationError('This proposal is no longer active.')
  }

  await prisma.expenseShare.update({
    where: { id: share.id },
    data: { reaction: rawReaction },
  })

  await revalidateGroupMembers(share.expense.groupId)
}

export async function commitProposal(formData: FormData): Promise<void> {
  const expenseId = getRequiredString(formData, 'expenseId')
  const userId = await getAuthUserId()

  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: { group: { select: { id: true } } },
  })
  if (!expense || expense.type !== 'PROPOSAL') throw new ValidationError('Proposal not found.')
  if (expense.payerId !== userId) throw new ValidationError('Only the proposer can commit.')

  await prisma.expense.update({
    where: { id: expenseId },
    data: { status: 'COMMITTED', coolingUntil: null },
  })

  await revalidateGroupMembers(expense.group.id)
}

export async function cancelProposal(formData: FormData): Promise<void> {
  const expenseId = getRequiredString(formData, 'expenseId')
  const userId = await getAuthUserId()

  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: {
      group: { select: { id: true } },
      shares: { select: { userId: true } },
    },
  })
  if (!expense || expense.type !== 'PROPOSAL') throw new ValidationError('Proposal not found.')

  const isProposer = expense.payerId === userId
  const isParticipant = expense.shares.some(s => s.userId === userId)
  if (!isProposer && !isParticipant) throw new ValidationError('Not part of this proposal.')

  await prisma.expense.update({ where: { id: expenseId }, data: { status: 'CANCELLED' } })
  await revalidateGroupMembers(expense.group.id)
}

export async function resplitAll(formData: FormData): Promise<void> {
  const groupId = getRequiredString(formData, 'groupId')
  const userId = await getAuthUserId()
  await requireActiveMembership(groupId, userId)

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: { where: { status: 'ACTIVE' }, select: { userId: true } },
      guestMembers: { select: { id: true } },
      expenses: {
        where: { status: 'COMMITTED', NOT: { description: 'Settlement' } },
        select: { id: true, amountCents: true, payerId: true },
      },
    },
  })
  if (!group) throw new ValidationError('Group not found.')

  const memberIds = group.members.map(m => m.userId)
  const guestIds = group.guestMembers.map(g => g.id)
  const totalPeople = memberIds.length + guestIds.length

  await prisma.$transaction(
    group.expenses.flatMap(e => {
      const base = Math.floor(e.amountCents / totalPeople)
      const remainder = e.amountCents - base * totalPeople
      const memberShares = memberIds.map(uid => ({
        userId: uid,
        shareCents: uid === e.payerId ? base + remainder : base,
      }))
      const guestSharesData = guestIds.map(gid => ({ guestId: gid, shareCents: base }))
      return [
        prisma.expenseShare.deleteMany({ where: { expenseId: e.id } }),
        prisma.guestExpenseShare.deleteMany({ where: { expenseId: e.id } }),
        prisma.expense.update({
          where: { id: e.id },
          data: {
            shares: { create: memberShares },
            guestShares: { create: guestSharesData },
          },
        }),
      ]
    }),
  )

  await revalidateGroupMembers(groupId)
  redirect(`/groups/${groupId}`)
}

/**
 * Settle up — records ONLY the per-payment toggles the user explicitly
 * confirmed. Each formData entry like `confirm:<from>:<to>:<cents>` represents
 * one accepted row from the simplified plan.
 */
export async function settleGroup(formData: FormData): Promise<void> {
  const groupId = getRequiredString(formData, 'groupId')
  const userId = await getAuthUserId()
  await requireActiveMembership(groupId, userId)

  const confirmed = formData.getAll('confirm').filter((v): v is string => typeof v === 'string')
  if (confirmed.length === 0) {
    redirect(`/groups/${groupId}`)
  }

  const expenses = await expensesRepo.findByGroup(groupId)
  const plan = settlementPlan(expenses)

  const accepted = plan.filter(p => {
    const key = `${p.from}:${p.to}:${p.amountCents}`
    if (!confirmed.includes(key)) return false
    return p.from === userId || p.to === userId
  })
  if (accepted.length === 0) {
    redirect(`/groups/${groupId}`)
  }

  await prisma.$transaction(
    accepted.map(p =>
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

  await revalidateGroupMembers(groupId)
  redirect(`/groups/${groupId}`)
}
