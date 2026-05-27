import { TopBar } from './top-bar'

export function TopBarSkeleton({ initial }: { initial: string }) {
  return <TopBar coolingItems={[]} invites={[]} groupExpenses={[]} userInitial={initial} />
}
