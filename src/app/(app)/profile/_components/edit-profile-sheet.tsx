'use client'

import { useTransition, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Camera } from 'lucide-react'
import { updateProfile } from '@/app/actions/users'
import { ErrorBanner } from '@/components/ui/error-banner'
import { SheetFrame } from '@/components/ui/sheet-frame'
import { CropAvatarSheet } from './crop-avatar-sheet'
import { cn } from '@/lib/utils'

const MAX_RAW_BYTES = 10 * 1024 * 1024  // reject before crop if file is absurdly large

interface Props {
  initialName: string
  initialAvatarUrl: string | null
  email: string
  onClose: () => void
}

export function EditProfileSheet({ initialName, initialAvatarUrl, email, onClose }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState(initialName)
  const [preview, setPreview] = useState<string | null>(initialAvatarUrl)

  // Raw object URL passed into the crop sheet
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  // Compressed + cropped blob ready to upload
  const compressedRef = useRef<Blob | null>(null)

  const fileRef = useRef<HTMLInputElement>(null)

  const trimmedName = name.trim()
  const dirty = (trimmedName !== initialName && trimmedName.length > 0) || compressedRef.current !== null

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''  // reset so re-picking same file triggers onChange again

    if (file.size > MAX_RAW_BYTES) {
      setError('Image is too large (10 MB max). Please pick a smaller file.')
      return
    }

    setError(null)
    setCropSrc(URL.createObjectURL(file))
  }

  function onCropConfirm(blob: Blob, previewUrl: string) {
    compressedRef.current = blob
    setPreview(previewUrl)
    setCropSrc(null)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const fd = new FormData()
    fd.set('name', trimmedName)
    if (compressedRef.current) {
      fd.set('avatar', compressedRef.current, 'avatar.jpg')
    }

    startTransition(async () => {
      const result = await updateProfile(null, fd)
      if (result) {
        setError(result)
      } else {
        toast.success('Profile updated')
        router.refresh()
        onClose()
      }
    })
  }

  const initial = (trimmedName || initialName || 'U').charAt(0).toUpperCase()

  // Crop sheet takes over the whole screen while open
  if (cropSrc) {
    return (
      <CropAvatarSheet
        src={cropSrc}
        onConfirm={onCropConfirm}
        onCancel={() => setCropSrc(null)}
      />
    )
  }

  return (
    <SheetFrame
      title="Edit profile"
      onClose={onClose}
      size="auto"
      footer={
        <button
          type="submit"
          form="edit-profile-form"
          disabled={isPending || !dirty}
          className="w-full h-14 rounded-xl bg-primary text-primary-foreground text-base font-semibold transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? 'Saving…' : 'Save changes'}
        </button>
      }
    >
      <form
        id="edit-profile-form"
        onSubmit={handleSubmit}
        className="px-5 pb-5 space-y-5"
      >
        {/* Avatar picker */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative group"
            aria-label="Change profile photo"
          >
            {preview ? (
              <img
                src={preview}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/20"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold to-gold-deep text-white flex items-center justify-center font-display text-4xl font-medium ring-4 ring-primary/20">
                {initial}
              </div>
            )}
            <div className={cn(
              'absolute inset-0 rounded-full flex items-center justify-center',
              'bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity',
            )}>
              <Camera size={22} strokeWidth={1.8} className="text-white" />
            </div>
          </button>
          <p className="text-[11px] text-muted-foreground">Tap to change · crop &amp; rotate after picking</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={onFileChange}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="profile-name"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Display name
          </label>
          <input
            id="profile-name"
            name="name"
            type="text"
            required
            maxLength={60}
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full h-13 px-4 rounded-lg bg-background border border-border text-base font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          />
          <p className="text-[11px] text-muted-foreground">
            Shown to other group members and on your dashboard greeting.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Email
          </label>
          <div className="w-full h-13 px-4 rounded-lg bg-muted border border-border text-base font-medium text-muted-foreground flex items-center">
            {email}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Tied to your sign-in. Change it from your auth provider.
          </p>
        </div>

        <ErrorBanner message={error} />
      </form>
    </SheetFrame>
  )
}
