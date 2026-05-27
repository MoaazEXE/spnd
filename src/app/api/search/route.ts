import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase/server'
import { itemsRepo } from '@/data/items.repo'
import { groupsRepo } from '@/data/groups.repo'
import { expensesRepo } from '@/data/expenses.repo'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = (url.searchParams.get('q') ?? '').trim()

  const user = await getCurrentUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (!q) {
    const recent = (await itemsRepo.findManyByUser(user.id)).slice(0, 5)
    return NextResponse.json({
      items: recent.map(i => ({
        id: i.id,
        title: i.title,
        amountCents: i.amountCents,
        status: i.status,
        coolingUntil: new Date(i.coolingUntil).toISOString(),
      })),
      groups: [],
      members: [],
      expenses: [],
      isDefault: true,
    })
  }

  // If a single category is dominant we let it claim more rows.
  const [items, groups, members, expenses] = await Promise.all([
    itemsRepo.searchByUser(user.id, q, 6),
    groupsRepo.searchByUser(user.id, q, 4),
    groupsRepo.searchMembersByUser(user.id, q, 4),
    expensesRepo.searchByUser(user.id, q, 6),
  ])

  return NextResponse.json({
    items: items.map(i => ({
      id: i.id,
      title: i.title,
      amountCents: i.amountCents,
      status: i.status,
      coolingUntil: new Date(i.coolingUntil).toISOString(),
    })),
    groups: groups.map(g => ({
      id: g.id,
      name: g.name,
      memberCount: g._count.members,
    })),
    members: members.map(m => ({
      id: m.id,
      name: m.name,
      email: m.email,
      groupId: m.groupMembers[0]?.group.id ?? null,
      groupName: m.groupMembers[0]?.group.name ?? null,
    })),
    expenses: expenses.map(e => ({
      id: e.id,
      description: e.description,
      amountCents: e.amountCents,
      groupId: e.group.id,
      groupName: e.group.name,
    })),
    isDefault: false,
  })
}
