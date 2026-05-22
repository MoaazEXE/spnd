// Authenticated app shell — nav, sidebar, and auth guard added in Sprint 1 (Day 2)
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Nav will go here */}
      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
