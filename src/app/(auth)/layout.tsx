import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase/server'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (user) redirect('/dashboard')

  return (
    <div className="relative min-h-screen flex items-center justify-center p-7 overflow-hidden bg-background">
      {/* Decorative gradients — pure CSS, GPU-only repaints */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-30 -left-20 h-[360px] w-[360px] rounded-full"
        style={{ background: 'radial-gradient(circle, color-mix(in oklab, var(--primary) 10%, transparent), transparent 70%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-25 -right-15 h-[280px] w-[280px] rounded-full"
        style={{ background: 'radial-gradient(circle, color-mix(in oklab, var(--gold) 18%, transparent), transparent 70%)' }}
      />
      <div className="relative w-full max-w-sm">{children}</div>
    </div>
  )
}
