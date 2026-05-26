import { Skeleton } from '@/components/ui/skeleton'

export default function SettleLoading() {
  return (
    <div className="max-w-[640px] mx-auto px-5 lg:px-12 pt-4 lg:pt-8 pb-32 lg:pb-16">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-10 w-40 mb-4" />
      <Skeleton className="h-16 rounded-2xl mb-5" />
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-48 rounded-2xl mb-5" />
      <Skeleton className="h-4 w-32 mb-2" />
      <Skeleton className="h-40 rounded-2xl" />
    </div>
  )
}
