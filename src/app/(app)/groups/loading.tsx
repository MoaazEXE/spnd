import { Skeleton } from '@/components/ui/skeleton'

export default function GroupsLoading() {
  return (
    <div className="max-w-[1080px] mx-auto px-5 lg:px-12 pt-6 lg:pt-8 pb-8">
      <Skeleton className="h-9 w-32" />
      <Skeleton className="mt-2 h-4 w-60" />
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </div>
  )
}
