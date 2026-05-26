'use client'

import { useCallback, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'auto' | 'tall'
}

const CLOSE_DURATION = 240 // ms — matches animate-sheet-down
const DRAG_THRESHOLD = 80  // px drag distance to trigger close

/**
 * Standard bottom sheet: scrim + rounded top container + drag handle + header + body.
 * Use `footer` for a sticky action bar that should remain visible while body scrolls.
 *
 * Supports:
 *  - Smooth slide-down close animation (mirrors the slide-up open)
 *  - Drag-to-close via the handle bar at the top
 */
export function SheetFrame({ title, onClose, children, footer, size = 'auto' }: Props) {
  const [closing, setClosing] = useState(false)
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startY = useRef(0)
  const sheetRef = useRef<HTMLDivElement>(null)

  const animateClose = useCallback(() => {
    if (closing) return
    setClosing(true)
    setTimeout(onClose, CLOSE_DURATION)
  }, [closing, onClose])

  /* ── Drag-to-close (pointer events work for both touch + mouse) ── */
  function onDragStart(e: React.PointerEvent) {
    startY.current = e.clientY
    setDragging(true)
    setDragY(0)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  function onDragMove(e: React.PointerEvent) {
    if (!dragging) return
    const dy = Math.max(0, e.clientY - startY.current) // only allow downward drag
    setDragY(dy)
  }

  function onDragEnd() {
    if (!dragging) return
    setDragging(false)
    if (dragY >= DRAG_THRESHOLD) {
      animateClose()
    } else {
      setDragY(0)
    }
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-40 flex flex-col justify-end',
        closing && 'animate-scrim-fade-out',
      )}
    >
      <div className="absolute inset-0 bg-foreground/40" onClick={animateClose} />

      <div
        ref={sheetRef}
        className={cn(
          'relative flex flex-col bg-background rounded-t-3xl',
          closing ? 'animate-sheet-down' : 'animate-sheet-up',
          size === 'tall' && 'max-h-[92vh]',
        )}
        style={
          dragging && dragY > 0
            ? { transform: `translateY(${dragY}px)`, transition: 'none' }
            : undefined
        }
      >
        {/* Drag handle — touch/click and drag down to close */}
        <div
          className="flex-shrink-0 flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none"
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
        >
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="flex-shrink-0 flex items-center px-5 py-3">
          <button
            type="button"
            onClick={animateClose}
            aria-label="Close"
            className="w-11 h-11 lg:w-9 lg:h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <X size={18} strokeWidth={2} className="text-muted-foreground" />
          </button>
          <h2 className="flex-1 text-center text-base font-semibold tracking-tight">{title}</h2>
          <div className="w-11 lg:w-9" />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>

        {footer && (
          <div className="flex-shrink-0 px-5 py-4 bg-background border-t border-sep">{footer}</div>
        )}
      </div>
    </div>
  )
}
