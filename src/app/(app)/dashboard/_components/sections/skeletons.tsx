import { Skeleton } from '@/components/ui/skeleton'

export function HeroRowSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
      <Skeleton className="h-60 rounded-2xl" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-44 rounded-2xl" />
      </div>
    </div>
  )
}

export function CoolingSectionSkeleton() {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {[0, 1, 2].map(i => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    </section>
  )
}

export function BottomRowSkeleton() {
  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Skeleton className="h-56 rounded-2xl" />
      <Skeleton className="h-56 rounded-2xl" />
    </div>
  )
}
