export default function CoolingLoading() {
  return (
    <div className="max-w-[520px] lg:max-w-[1080px] mx-auto px-5 lg:px-12 pt-6 lg:pt-8 pb-8">
      <div className="h-9 w-32 bg-card rounded-[10px] animate-pulse" />
      <div className="h-4 w-60 bg-card rounded-[6px] animate-pulse mt-2" />
      <div className="flex gap-2 mt-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-10 w-28 bg-card rounded-[12px] animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-card rounded-[20px] animate-pulse" />
        ))}
      </div>
    </div>
  )
}
