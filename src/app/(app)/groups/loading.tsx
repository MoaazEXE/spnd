import { Skeleton } from '@/components/ui/skeleton'

export default function GroupsLoading() {
  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex flex-col px-8 pt-8 pb-8">
        <Skeleton className="h-9 w-28 mb-2" />
        <Skeleton className="h-4 w-72 mb-6" />
        <div className="flex gap-4 items-start">
          {/* Left panel */}
          <div className="w-[270px] flex-shrink-0 flex flex-col gap-2">
            <Skeleton className="h-[72px] rounded-2xl" />
            <Skeleton className="h-[72px] rounded-2xl" />
            <Skeleton className="h-[72px] rounded-2xl" />
            <Skeleton className="h-11 rounded-2xl mt-1" />
          </div>
          {/* Right panel */}
          <div className="flex-1 rounded-2xl bg-card shadow-card p-6 flex flex-col gap-5">
            <div className="flex items-start gap-4">
              <Skeleton className="w-16 h-16 rounded-2xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-8 w-44" />
                <Skeleton className="h-4 w-56" />
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Skeleton className="h-9 w-28 rounded-lg" />
                <Skeleton className="h-9 w-24 rounded-lg" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
            </div>
            <Skeleton className="h-[72px] rounded-xl" />
            <div className="flex gap-5">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-14 mb-3" />
                <Skeleton className="h-14 rounded-2xl" />
                <Skeleton className="h-14 rounded-2xl" />
                <Skeleton className="h-14 rounded-2xl" />
              </div>
              <div className="w-[300px] space-y-2">
                <Skeleton className="h-3 w-32 mb-3" />
                <Skeleton className="h-32 rounded-2xl" />
                <Skeleton className="h-3 w-16 mt-5 mb-3" />
                <Skeleton className="h-24 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden max-w-[640px] mx-auto px-5 pt-6 pb-8">
        <Skeleton className="h-9 w-28 mb-2" />
        <Skeleton className="h-4 w-60 mb-6" />
        <Skeleton className="h-28 rounded-2xl mb-5" />
        <Skeleton className="h-3 w-20 mb-3" />
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-[72px] rounded-2xl" />
          <Skeleton className="h-[72px] rounded-2xl" />
          <Skeleton className="h-[72px] rounded-2xl" />
        </div>
      </div>
    </>
  )
}
