import { Nav } from './nav'

/**
 * Identity-only nav fallback. Renders the same shell but with zero badges
 * and a dashed savings figure. No layout shift when real data arrives.
 */
export function NavSkeleton({
  name,
  email,
  initial,
}: {
  name: string
  email: string
  initial: string
}) {
  return (
    <Nav
      name={name}
      email={email}
      initial={initial}
      savedCents={0}
      coolingCount={0}
      groupsCount={0}
    />
  )
}
