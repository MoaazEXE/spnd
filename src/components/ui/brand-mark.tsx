import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

type Size = 'sm' | 'md' | 'lg'

const sizeMap: Record<Size, { px: number; text: string }> = {
  sm: { px: 32, text: 'text-lg' },
  md: { px: 36, text: 'text-2xl' },
  lg: { px: 40, text: 'text-2xl' },
}

interface Props {
  size?: Size
  showName?: boolean
  href?: string
  className?: string
}

export function BrandMark({ size = 'md', showName = true, href, className }: Props) {
  const styles = sizeMap[size]
  const inner = (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <Image
        src="/settle-icon.png"
        alt="Settle"
        width={styles.px}
        height={styles.px}
        priority
        className="rounded-[20%]"
      />
      {showName && (
        <span className={cn('font-semibold tracking-tight text-foreground', styles.text)}>
          Settle
        </span>
      )}
    </span>
  )
  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        {inner}
      </Link>
    )
  }
  return inner
}
