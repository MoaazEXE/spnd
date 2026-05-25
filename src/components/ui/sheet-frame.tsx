'use client'

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'auto' | 'tall'
}

/**
 * Standard bottom sheet: scrim + rounded top container + drag handle + header + body.
 * Use `footer` for a sticky action bar that should remain visible while body scrolls.
 */
export function SheetFrame({ title, onClose, children, footer, size = 'auto' }: Props) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />

      <div
        className={cn(
          'relative flex flex-col bg-background rounded-t-3xl animate-sheet-up',
          size === 'tall' && 'max-h-[92vh]',
        )}
      >
        <div className="flex-shrink-0 flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="flex-shrink-0 flex items-center px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <X size={18} strokeWidth={2} className="text-muted-foreground" />
          </button>
          <h2 className="flex-1 text-center text-base font-semibold tracking-tight">{title}</h2>
          <div className="w-9" />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>

        {footer && (
          <div className="flex-shrink-0 px-5 py-4 bg-background border-t border-sep">{footer}</div>
        )}
      </div>
    </div>
  )
}
