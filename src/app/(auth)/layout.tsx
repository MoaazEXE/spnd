export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-5"
      style={{
        background:
          'radial-gradient(circle at 10% 10%, rgba(45,95,91,0.08) 0%, transparent 50%), ' +
          'radial-gradient(circle at 90% 90%, rgba(201,169,97,0.08) 0%, transparent 50%), ' +
          'var(--background)',
      }}
    >
      {children}
    </div>
  )
}
