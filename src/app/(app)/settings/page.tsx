import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { usersRepo } from '@/data/users.repo'
import { SettingsForm } from './_components/settings-form'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await usersRepo.findById(user.id)

  return (
    <div className="max-w-lg mx-auto px-5 py-6">
      <h1 className="text-[22px] font-bold tracking-tight text-foreground mb-6">Settings</h1>

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
  )
}
