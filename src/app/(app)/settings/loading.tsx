export default function SettingsLoading() {
  return (
    <div className="max-w-[600px] mx-auto px-5 lg:px-12 pt-6 lg:pt-8 pb-8">
      <div className="h-9 w-40 bg-card rounded-[10px] animate-pulse" />
      <div className="h-4 w-72 bg-card rounded-[6px] animate-pulse mt-2" />
      <div className="space-y-4 mt-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-20 bg-card rounded-[16px] animate-pulse" />
        ))}
      </div>
    </div>
  )
}
