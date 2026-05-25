'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Subscribes to Supabase Realtime for a group's expenses + members. On any
 * change (insert/update/delete) the App Router refreshes the current route
 * — the deep cached fetch re-runs and the UI catches up.
 *
 * Requires the publication to include these tables in Supabase:
 *   alter publication supabase_realtime add table "Expense", "GroupMember", "ExpenseShare";
 *
 * Silently does nothing if Realtime isn't enabled — production-safe fallback.
 */
export function useGroupRealtime(groupId: string) {
  const router = useRouter()

  useEffect(() => {
    if (!groupId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`group-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Expense',
          filter: `groupId=eq.${groupId}`,
        },
        () => router.refresh(),
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'GroupMember',
          filter: `groupId=eq.${groupId}`,
        },
        () => router.refresh(),
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ExpenseShare',
        },
        () => router.refresh(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [groupId, router])
}
