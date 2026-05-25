'use client'

import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary'

const variantStyles: Record<Variant, string> = {
  primary:
    'h-14 rounded-xl bg-primary text-primary-foreground text-base font-semibold hover:bg-primary-deep',
  secondary:
    'h-12 rounded-lg bg-primary-tint text-primary-deep text-sm font-semibold hover:bg-primary-soft',
}

interface Props {
  variant?: Variant
  pending?: boolean
  pendingLabel?: string
  children: React.ReactNode
  className?: string
}

export function SubmitButton({
  variant = 'secondary',
  pending,
  pendingLabel,
  children,
  className,
}: Props) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        'w-full transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        className,
      )}
    >
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  )
}
