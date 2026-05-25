'use client'

import { useEffect, useRef, useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'

interface BaseProps {
  open: boolean
  title: string
  description?: string
  confirmLabel: string
  cancelLabel?: string
  destructive?: boolean
  busy?: boolean
  onCancel: () => void
}

interface ConfirmProps extends BaseProps {
  onConfirm: () => void | Promise<void>
  requireText?: never
}

interface TypeToConfirmProps extends BaseProps {
  requireText: string
  onConfirm: () => void | Promise<void>
}

type Props = ConfirmProps | TypeToConfirmProps

/**
 * Styled confirm dialog — replaces native confirm()/prompt() for destructive
 * flows so the calm design tone survives moments of doubt.
 *
 * Two modes:
 * - Simple confirm: just Cancel / Confirm.
 * - Type-to-confirm: user must type `requireText` exactly before the confirm
 *   button enables. Use for irreversible actions (delete-group, etc).
 */
export function ConfirmDialog(props: Props) {
  const {
    open,
    title,
    description,
    confirmLabel,
    cancelLabel = 'Cancel',
    destructive,
    busy,
    onCancel,
    onConfirm,
  } = props

  const requireText = 'requireText' in props ? props.requireText : null
  const [typed, setTyped] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    setTyped('')
    const t = requestAnimationFrame(() => {
      if (requireText) inputRef.current?.focus()
      else confirmRef.current?.focus()
    })
    return () => cancelAnimationFrame(t)
  }, [open, requireText])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  const canConfirm = !busy && (!requireText || typed === requireText)
  const Icon = destructive ? AlertTriangle : null
  const iconBg = destructive ? 'bg-coral-tint text-coral-deep' : 'bg-primary-tint text-primary-deep'
  const confirmCls = destructive
    ? 'bg-coral-deep text-white hover:bg-coral-deep/90'
    : 'bg-primary text-primary-foreground hover:bg-primary-deep'

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div
        className="absolute inset-0 bg-foreground/45 backdrop-blur-sm animate-fade-in"
        onClick={busy ? undefined : onCancel}
      />
      <div className="relative w-full max-w-[420px] bg-card rounded-2xl shadow-pop animate-pop overflow-hidden">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          aria-label="Close"
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          <X size={16} strokeWidth={2} />
        </button>

        <div className="px-6 pt-7 pb-5">
          {Icon && (
            <div
              className={`mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}
            >
              <Icon size={20} strokeWidth={1.8} />
            </div>
          )}
          <h2
            id="confirm-title"
            className="text-center text-base font-semibold text-foreground"
          >
            {title}
          </h2>
          {description && (
            <p className="mt-2 text-center text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}

          {requireText && (
            <div className="mt-5 space-y-1.5">
              <label
                htmlFor="confirm-type"
                className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Type <span className="text-foreground">{requireText}</span> to confirm
              </label>
              <input
                id="confirm-type"
                ref={inputRef}
                value={typed}
                onChange={e => setTyped(e.target.value)}
                disabled={busy}
                className="w-full h-11 px-3 rounded-lg bg-background border border-border text-sm font-medium text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors disabled:opacity-50"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 h-11 rounded-lg text-sm font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={() => canConfirm && onConfirm()}
            disabled={!canConfirm}
            className={`flex-[1.4] h-11 rounded-lg text-sm font-semibold transition-colors active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed ${confirmCls}`}
          >
            {busy ? '…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
