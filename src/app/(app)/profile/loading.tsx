export default function ProfileLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero banner skeleton */}
      <div className="relative bg-gradient-to-br from-primary to-primary-deep">
        <div className="px-5 lg:px-12 pt-8 lg:pt-12 pb-16 lg:pb-20">
          <div className="flex items-start gap-4 lg:gap-8">
            <div className="w-20 h-20 lg:w-[132px] lg:h-[132px] rounded-full bg-white/10" />
            <div className="flex-1 min-w-0 pt-1">
              <div className="w-32 h-3 rounded bg-white/10 mb-3" />
              <div className="w-48 lg:w-64 h-8 lg:h-12 rounded bg-white/10 mb-3" />
              <div className="w-56 h-4 rounded bg-white/10" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats strip skeleton */}
      <div className="mx-5 lg:mx-12 -mt-10 bg-card rounded-2xl shadow-card">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="p-5">
              <div className="w-20 h-2.5 rounded bg-muted mb-3" />
              <div className="w-24 h-7 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <div className="px-5 lg:px-12 pt-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
          <div className="space-y-4">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-20 rounded-2xl bg-card shadow-card" />
            ))}
          </div>
          <div className="space-y-4">
            {[0, 1].map(i => (
              <div key={i} className="h-24 rounded-2xl bg-card shadow-card" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
