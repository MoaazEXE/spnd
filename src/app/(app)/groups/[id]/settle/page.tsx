import Link from 'next/link'
import { ArrowLeft, ArrowRight, Sparkles, Check } from 'lucide-react'
import { notFound, redirect } from 'next/navigation'
import { groupsRepo } from '@/data/groups.repo'
import { getUserContext } from '@/lib/user-context'
import { settlementPlan } from '@/core/debt/groupBalances'
import { settleGroup } from '@/app/actions/groups'
import { Avatar } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { fmtRM } from '@/lib/formatters'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SettlePage({ params }: PageProps) {
  const { id } = await params
  const ctx = await getUserContext()
  if (!ctx) redirect('/login')

  const group = await groupsRepo.findByIdDeep(id, ctx.id)
  if (!group) notFound()

  const plan = settlementPlan(group.expenses)

  const nameById = new Map(group.members.map(m => [m.userId, m.user.name]))
  const labelFor = (uid: string) =>
    uid === ctx.id ? 'You' : nameById.get(uid) ?? 'Member'

  return (
    <div className="max-w-[640px] mx-auto px-5 lg:px-12 pt-4 lg:pt-8 pb-32 lg:pb-16">
      <div className="mb-3">
        <Link
          href={`/groups/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={2} />
          {group.name}
        </Link>
      </div>

      <h1 className="font-display text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
        Settle up
      </h1>

      {plan.length === 0 ? (
        <Card className="mt-5 text-center py-10" padding="none">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary-tint flex items-center justify-center text-primary mb-3">
            <Check size={20} strokeWidth={2} />
          </div>
          <p className="text-sm font-semibold text-foreground">Everyone&apos;s already even.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            No outstanding balances in this group.
          </p>
        </Card>
      ) : (
        <>
          <div className="mt-4 mb-5 flex items-start gap-3 bg-primary-tint rounded-2xl p-4">
            <Sparkles size={18} strokeWidth={1.8} className="text-primary-deep mt-0.5 flex-shrink-0" />
            <p className="text-xs text-primary-deep leading-relaxed">
              Simplified to the fewest possible payments. Just{' '}
              <strong>
                {plan.length} {plan.length === 1 ? 'transfer' : 'transfers'}
              </strong>{' '}
              and everyone&apos;s even.
            </p>
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Payments
          </p>
          <Card padding="none">
            {plan.map((p, i) => {
              const fromLabel = labelFor(p.from)
              const toLabel = labelFor(p.to)
              return (
                <div
                  key={i}
                  className={
                    'flex items-center gap-3 px-4 py-4 ' +
                    (i < plan.length - 1 ? 'border-b border-sep' : '')
                  }
                >
                  <Avatar name={fromLabel} size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-muted-foreground">
                      {fromLabel === 'You' ? 'You pay' : `${fromLabel} pays`}
                    </p>
                    <p className="text-sm font-semibold text-foreground truncate">{toLabel}</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-primary-tint text-primary flex items-center justify-center flex-shrink-0">
                    <ArrowRight size={14} strokeWidth={2} />
                  </div>
                  <Avatar name={toLabel} size={36} />
                  <p className="text-base font-bold text-foreground tabular-nums flex-shrink-0 min-w-[72px] text-right">
                    {fmtRM(p.amountCents)}
                  </p>
                </div>
              )
            })}
          </Card>

          <form
            action={settleGroup}
            className="fixed lg:static bottom-[60px] lg:bottom-auto inset-x-0 lg:inset-auto px-5 lg:px-0 py-3 lg:py-0 lg:mt-6 bg-background lg:bg-transparent border-t lg:border-t-0 border-sep z-10"
          >
            <input type="hidden" name="groupId" value={id} />
            <div className="max-w-[640px] mx-auto flex gap-2.5">
              <Link
                href={`/groups/${id}`}
                className="flex-1 h-12 rounded-lg inline-flex items-center justify-center text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="flex-[1.4] h-12 rounded-lg bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-primary-deep transition-colors active:scale-[0.97]"
              >
                <Check size={16} strokeWidth={2} />
                Mark as paid
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}
