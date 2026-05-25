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
      prefetch
      className="group inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full bg-gold-tint text-gold-deep hover:bg-gold/30 transition-colors"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
      <span className="text-xs font-semibold">
        {count} {count === 1 ? 'item is' : 'items are'} ready to decide
      </span>
      <span className="inline-flex items-center gap-1 h-7 px-2.5 ml-1 rounded-full bg-gold text-primary-foreground text-xs font-semibold">
        Review
        <ArrowRight
          size={12}
          strokeWidth={2.5}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  )
}
