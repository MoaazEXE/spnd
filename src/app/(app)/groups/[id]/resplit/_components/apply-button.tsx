'use client'

import { useFormStatus } from 'react-dom'
import { Scale, Loader2 } from 'lucide-react'

interface Props {
  anyChange: boolean
}

/**
 * Submit button for the re-split form. Uses useFormStatus so the parent
 * server-component form can drive the loading state without lifting any
 * pending logic into a client wrapper around the whole page.
 */
export function ApplyResplitButton({ anyChange }: Props) {
  const { pending } = useFormStatus()
  const disabled = !anyChange || pending

  return (
    <button
      type="submit"
      disabled={disabled}
      aria-busy={pending}
      className="flex-[1.4] lg:flex-none lg:px-8 h-12 rounded-lg bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-primary-deep transition-colors active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <Loader2 size={16} strokeWidth={2} className="animate-spin" />
          Re-splitting…
        </>
      ) : (
        <>
          <Scale size={16} strokeWidth={2} />
          {anyChange ? 'Apply re-split' : 'Already even'}
        </>
      )}
    </button>
  )
}
