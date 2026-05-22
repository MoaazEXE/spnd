import Link from 'next/link'
import { Settings, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const name = typeof user?.user_metadata?.name === 'string'
    ? user.user_metadata.name
    : user?.email?.split('@')[0] ?? ''

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="h-14 border-b border-border/60 flex items-center px-5">
        <Link href="/settings" className="flex-1 flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <Settings size={20} strokeWidth={1.8} />
        </Link>
        <span className="text-sm font-semibold tracking-[-0.2px]">Spnd</span>
        <div className="flex-1 flex justify-end items-center gap-3">
          <Link href="/groups" className="text-muted-foreground hover:text-foreground transition-colors">
            <Users size={20} strokeWidth={1.8} />
          </Link>
          {name && (
            <span className="text-xs text-muted-foreground hidden sm:block">{name}</span>
          )}
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm" className="text-xs text-muted-foreground">
              Sign out
            </Button>
          </form>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
