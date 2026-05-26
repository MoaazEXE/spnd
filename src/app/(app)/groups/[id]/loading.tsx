import { Skeleton } from '@/components/ui/skeleton'

export default function GroupDetailLoading() {
  return (
    <div className="max-w-[640px] mx-auto px-5 lg:px-12 pt-4 lg:pt-8 pb-32 lg:pb-16">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>

      <Skeleton className="h-56 rounded-2xl mb-4" />
      <Skeleton className="h-11 rounded-xl mb-4" />

      <div className="flex flex-col gap-2.5">
        {[0, 1, 2].map(i => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
