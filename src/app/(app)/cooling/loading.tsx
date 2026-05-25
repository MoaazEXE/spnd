import { Skeleton } from '@/components/ui/skeleton'

export default function CoolingLoading() {
  return (
    <div className="max-w-[520px] lg:max-w-[1080px] mx-auto px-5 lg:px-12 pt-6 lg:pt-8 pb-8">
      <Skeleton className="h-9 w-32" />
      <Skeleton className="mt-2 h-4 w-60" />
      <div className="mt-6 flex gap-2">
        {[0, 1, 2, 3].map(i => (
          <Skeleton key={i} className="h-10 w-28 rounded-md" />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {[0, 1, 2].map(i => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
