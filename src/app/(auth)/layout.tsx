export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-7 relative overflow-hidden"
      style={{ background: 'var(--background)' }}
    >
      {/* Radial gradient — teal top-left */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: -120, left: -80,
          width: 360, height: 360, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(45,95,91,0.10), transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      {/* Radial gradient — gold bottom-right */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', bottom: -100, right: -60,
          width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,169,97,0.12), transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div className="relative w-full max-w-sm">
        {children}
      </div>
    </div>
  )
}
