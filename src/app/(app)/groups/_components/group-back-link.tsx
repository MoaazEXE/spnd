'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface Props {
  groupId: string
  groupName: string
}

/**
 * Back-to-group link used by sub-routes (settle, resplit). At click time,
 * picks the right destination for the viewport so desktop users go back to
 * the two-pane shell with the group preselected, and mobile users go to the
 * dedicated group detail page they came from.
 *
 * Avoids the previous "you're stuck in phone layout on desktop" problem when
 * navigating between /groups/[id], /groups/[id]/settle and /groups/[id]/resplit.
 */
export function GroupBackLink({ groupId, groupName }: Props) {
  const router = useRouter()

  function go(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    const isDesktop = typeof window !== 'undefined'
      && window.matchMedia('(min-width: 1024px)').matches
    router.push(isDesktop ? `/groups?selected=${groupId}` : `/groups/${groupId}`)
  }

  return (
    <a
      href={`/groups/${groupId}`}
      onClick={go}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      <ArrowLeft size={16} strokeWidth={2} />
      {groupName}
    </a>
  )
}
