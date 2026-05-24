import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase/server'
import { usersRepo } from '@/data/users.repo'
import { SettingsForm } from './_components/settings-form'

export default async function SettingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const dbUser = await usersRepo.findById(user.id)

  return (
    <div className="max-w-[920px] mx-auto px-5 pt-4 pb-12 lg:px-12 lg:pt-10">
      {/* Mobile back link — desktop sidebar provides nav */}
      <Link
        href="/dashboard"
        className="lg:hidden inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-muted)] hover:text-foreground transition-colors mb-3"
      >
        <ArrowLeft size={16} strokeWidth={2} />
        Dashboard
      </Link>

      <div className="mb-7 lg:mb-9">
        <h1 className="text-[28px] lg:text-[40px] font-bold tracking-[-0.8px] lg:tracking-[-1.2px] text-foreground">Income</h1>
        <p className="text-[13px] lg:text-[14px] text-[var(--text-muted)] mt-1.5">
          Calibrate the &ldquo;hours of your life&rdquo; lens.
        </p>
      </div>

      <div className="bg-card rounded-[20px] p-5 lg:p-8 shadow-[0_1px_2px_rgba(31,42,46,0.04),0_4px_16px_rgba(31,42,46,0.04)]">
        <SettingsForm
          initial={{
            monthlyIncomeCents: dbUser?.monthlyIncomeCents ?? null,
            workingHoursPerWeek: dbUser?.workingHoursPerWeek ?? null,
            timeCostMode: dbUser?.timeCostMode ?? 'SIMPLE',
            commuteHours: dbUser?.commuteHours ?? null,
            workCostsCents: dbUser?.workCostsCents ?? null,
          }}
        />
      </div>
    </div>
  )
}
