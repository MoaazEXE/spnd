import { getCurrentUser } from '@/lib/supabase/server'
import { generateFromEmail } from '@/lib/username'
import { OnboardingForm } from './_components/onboarding-form'

export default async function OnboardingPage() {
  const user = await getCurrentUser()
  const suggested = user?.email ? generateFromEmail(user.email) : 'myusername'

  return <OnboardingForm suggestedUsername={suggested} />
}
