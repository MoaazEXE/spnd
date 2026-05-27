'use client'

import { useTransition, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Camera, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { updateProfile, updateUsername, checkUsernameAvailable } from '@/app/actions/users'
import { validateUsername, normalizeUsername } from '@/lib/username'
import { ErrorBanner } from '@/components/ui/error-banner'
import { SheetFrame } from '@/components/ui/sheet-frame'
import { CropAvatarSheet } from './crop-avatar-sheet'
import { cn } from '@/lib/utils'

const MAX_RAW_BYTES = 10 * 1024 * 1024

type AvailabilityState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'available' }
  | { status: 'unavailable'; reason: string }

interface Props {
  initialName: string
  initialAvatarUrl: string | null
  email: string
  initialUsername: string | null
  onClose: () => void
}

export function EditProfileSheet({
  initialName,
  initialAvatarUrl,
  email,
  initialUsername,
  onClose,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState(initialName)
  const [preview, setPreview] = useState<string | null>(initialAvatarUrl)
  const [username, setUsername] = useState(initialUsername ?? '')
  const [availability, setAvailability] = useState<AvailabilityState>({ status: 'idle' })
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const compressedRef = useRef<Blob | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const trimmedName = name.trim()
  const normalizedUsername = normalizeUsername(username)
  const usernameChanged = normalizedUsername !== (initialUsername?.toLowerCase() ?? '')

  const localValidation = usernameChanged ? validateUsername(normalizedUsername) : { ok: true as const }

  useEffect(() => {
    if (!usernameChanged || !localValidation.ok) {
      setAvailability({ status: 'idle' })
      return
    }
    setAvailability({ status: 'checking' })
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const result = await checkUsernameAvailable(username)
      setAvailability(result.available
        ? { status: 'available' }
        : { status: 'unavailable', reason: result.reason ?? 'Not available.' })
    }, 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, usernameChanged])

  const usernameValid = !usernameChanged || availability.status === 'available'
  const nameDirty = trimmedName !== initialName && trimmedName.length > 0
  const dirty = nameDirty || compressedRef.current !== null || usernameChanged

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
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

    if (usernameChanged && !localValidation.ok) {
      setError(localValidation.reason)
      return
    }
    if (usernameChanged && availability.status !== 'available') {
      setError('Please wait for username availability to confirm.')
      return
    }

    startTransition(async () => {
      // Profile (name + avatar) — always submit even if only username changed,
      // so the name field is never lost. updateProfile requires name to be present.
      const profileFd = new FormData()
      profileFd.set('name', trimmedName || initialName)
      if (compressedRef.current) {
        profileFd.set('avatar', compressedRef.current, 'avatar.jpg')
      }

      if (nameDirty || compressedRef.current !== null) {
        const profileResult = await updateProfile(null, profileFd)
        if (profileResult) { setError(profileResult); return }
      }

      if (usernameChanged) {
        const usernameFd = new FormData()
        usernameFd.set('username', normalizedUsername)
        const usernameResult = await updateUsername(null, usernameFd)
        if (usernameResult) { setError(usernameResult); return }
      }

      toast.success('Profile updated')
      router.refresh()
      onClose()
    })
  }

  const initial = (trimmedName || initialName || 'U').charAt(0).toUpperCase()

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
          disabled={isPending || !dirty || !usernameValid}
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
          <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={onFileChange} />
        </div>

        {/* Display name */}
        <div className="space-y-2">
          <label
            htmlFor="profile-name"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Display name
          </label>
          <input
            id="profile-name"
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

        {/* Username */}
        <div className="space-y-2">
          <label
            htmlFor="profile-username"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Username
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-base select-none">
              @
            </span>
            <input
              id="profile-username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              maxLength={20}
              className="w-full h-13 pl-8 pr-12 rounded-lg bg-background border border-border text-base font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {usernameChanged && availability.status === 'checking' && (
                <Loader2 size={18} className="animate-spin text-muted-foreground" />
              )}
              {usernameChanged && availability.status === 'available' && (
                <CheckCircle2 size={18} className="text-green-500" />
              )}
              {usernameChanged && availability.status === 'unavailable' && (
                <XCircle size={18} className="text-destructive" />
              )}
            </div>
          </div>
          {usernameChanged && !localValidation.ok && (
            <p className="text-xs text-destructive px-1">{localValidation.reason}</p>
          )}
          {usernameChanged && availability.status === 'unavailable' && localValidation.ok && (
            <p className="text-xs text-destructive px-1">{availability.reason}</p>
          )}
          {usernameChanged && availability.status === 'available' && (
            <p className="text-xs text-green-600 px-1">@{normalizedUsername} is available!</p>
          )}
          {!usernameChanged && (
            <p className="text-[11px] text-muted-foreground">
              Others can find and invite you using @username.
            </p>
          )}
        </div>

        {/* Email (read-only) */}
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
