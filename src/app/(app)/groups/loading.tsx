export default function GroupsLoading() {
  return (
    <div className="max-w-[1080px] mx-auto px-5 lg:px-12 pt-6 lg:pt-8 pb-8">
      <div className="h-9 w-32 bg-card rounded-[10px] animate-pulse" />
      <div className="h-4 w-60 bg-card rounded-[6px] animate-pulse mt-2" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4 mt-6">
        <div className="h-64 bg-card rounded-[20px] animate-pulse" />
        <div className="h-96 bg-card rounded-[20px] animate-pulse" />
      </div>
    </div>
  )
}
