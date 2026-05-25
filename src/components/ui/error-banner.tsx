export function ErrorBanner({ message }: { message: string | null | undefined }) {
  if (!message) return null
  return (
    <p
      role="alert"
      className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md"
    >
      {message}
    </p>
  )
}
