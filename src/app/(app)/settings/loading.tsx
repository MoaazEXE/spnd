import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsLoading() {
  return (
    <div className="max-w-[600px] mx-auto px-5 lg:px-12 pt-6 lg:pt-8 pb-8">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="mt-2 h-4 w-72" />
      <div className="mt-6 space-y-4">
        {[0, 1, 2, 3].map(i => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
