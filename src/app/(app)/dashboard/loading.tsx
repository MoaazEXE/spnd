import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="max-w-[520px] lg:max-w-[1080px] mx-auto px-5 lg:px-12 pt-6 lg:pt-8 pb-8 lg:pb-16">
      <div className="mb-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-2 h-9 w-64" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
        <Skeleton className="h-60 rounded-2xl" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
      </div>

      <div className="mt-8">
        <Skeleton className="h-4 w-32" />
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[0, 1, 2].map(i => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-56 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    </div>
  )
}
