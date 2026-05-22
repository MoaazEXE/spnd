import { redirect } from 'next/navigation'

// Cooling queue lives on the dashboard in Sprint 1
export default function CoolingPage() {
  redirect('/dashboard')
}
