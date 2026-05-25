import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase/server'
import { itemsRepo } from '@/data/items.repo'
import { groupsRepo } from '@/data/groups.repo'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = (url.searchParams.get('q') ?? '').trim()

  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ items: [], groups: [], members: [] }, { status: 401 })
  }

  if (!q) {
    // Default state: recent activity across statuses for fast resume.
    const recent = (await itemsRepo.findManyByUser(user.id)).slice(0, 5)
    return NextResponse.json({
      items: recent.map(i => ({
        id: i.id,
        title: i.title,
        amountCents: i.amountCents,
        status: i.status,
        coolingUntil: i.coolingUntil.toISOString(),
      })),
      groups: [],
      members: [],
      isDefault: true,
    })
  }

  const [items, groups, members] = await Promise.all([
    itemsRepo.searchByUser(user.id, q, 6),
    groupsRepo.searchByUser(user.id, q, 4),
    groupsRepo.searchMembersByUser(user.id, q, 4),
  ])

  return NextResponse.json({
    items: items.map(i => ({
      id: i.id,
      title: i.title,
      amountCents: i.amountCents,
      status: i.status,
      coolingUntil: i.coolingUntil.toISOString(),
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
    isDefault: false,
  })
}
