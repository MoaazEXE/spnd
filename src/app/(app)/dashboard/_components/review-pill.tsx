import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface Props {
  count: number
}

export function ReviewPill({ count }: Props) {
  if (count === 0) return null

  return (
    <Link
      href="/cooling?tab=cooling"
      className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full bg-[var(--gold-tint)] text-[var(--gold-deep)] hover:bg-[#EDDFC0] transition-colors group"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-pulse" />
      <span className="text-[13px] font-semibold">
        {count} {count === 1 ? 'item is' : 'items are'} ready to decide
      </span>
      <span className="inline-flex items-center gap-1 h-7 px-2.5 ml-1 rounded-full bg-[var(--gold)] text-white text-[12px] font-semibold">
        Review
        <ArrowRight size={12} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}
