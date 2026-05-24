import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase/server'
import { itemsRepo } from '@/data/items.repo'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = (url.searchParams.get('q') ?? '').trim()
  if (!q) return NextResponse.json({ items: [], groups: [] })

  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ items: [], groups: [] }, { status: 401 })

  const items = await itemsRepo.searchByUser(user.id, q, 8)

  // TODO: Sprint 2 — replace with real groupsRepo.searchByUser
  const groups: { id: string; name: string; memberCount: number }[] = []

  return NextResponse.json({
    items: items.map(i => ({
      id: i.id,
      title: i.title,
      amountCents: i.amountCents,
      status: i.status,
      coolingUntil: i.coolingUntil.toISOString(),
    })),
    groups,
  })
}
