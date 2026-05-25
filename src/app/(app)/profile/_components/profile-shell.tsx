'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, LogOut, Users, ChevronRight } from 'lucide-react'
import { signOut } from '@/app/actions/auth'
import { fmtRM } from '@/lib/formatters'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ActivityItem {
  id: string
  title: string
  amountCents: number
  status: 'SKIPPED' | 'BOUGHT'
  resolvedAt: Date
}

interface Props {
  name: string
  email: string
  initial: string
  memberSince: Date
  savedCents: number
  skippedCount: number
  boughtCount: number
  coolingCount: number
  skipRatePct: number
  groupsCount: number
  biggestSaveCents: number
  biggestSaveTitle: string
  avgSaveCents: number
  lifeHours: number | null
  recentActivity: ActivityItem[]
}

function fmtHours(h: number): string {
  if (h < 1) return `${Math.round(h * 60)}m`
  if (h < 24) return `${h.toFixed(1)}h`
  const days = Math.floor(h / 24)
  return `${days}d ${Math.round(h % 24)}h`
}

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  if (diff < 3_600_000) return 'Just now'
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })
}

function fmtMemberSince(date: Date): string {
  return date.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })
}

export function ProfileShell({
  name,
  email,
  initial,
  memberSince,
  savedCents,
  skippedCount,
  boughtCount,
  coolingCount,
  skipRatePct,
  groupsCount,
  biggestSaveCents,
  biggestSaveTitle,
  avgSaveCents,
  lifeHours,
  recentActivity,
}: Props) {
  return (
    <div className="pb-8 lg:pb-16">
      {/* ═══ HERO BANNER ═══ */}
      <div className="relative">
        <div className="relative overflow-hidden">
          {/* Layered background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-deep to-[#18403D]" />
          <div className="absolute -top-44 -right-24 w-[540px] h-[540px] rounded-full bg-[radial-gradient(circle,_rgba(201,169,97,0.22),_transparent_65%)]" />
          <div className="absolute -bottom-48 -left-28 w-[440px] h-[440px] rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.06),_transparent_65%)]" />
          {/* Dot grain */}
          <div
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 0.6px, transparent 0.6px)',
              backgroundSize: '14px 14px',
            }}
          />

          <div className="relative z-[1] px-5 lg:px-12 pt-6 lg:pt-12 pb-16 lg:pb-[56px]">
            {/* Mobile back button */}
            <Link
              href="/dashboard"
              className="lg:hidden inline-flex items-center gap-1.5 mb-4 text-xs font-medium text-white/60 hover:text-white/80 transition-colors"
            >
              <ArrowLeft size={16} strokeWidth={2} />
              Dashboard
            </Link>

            <div className="flex items-start gap-4 lg:gap-8">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 lg:w-[132px] lg:h-[132px] rounded-full bg-gradient-to-br from-gold to-gold-deep text-white flex items-center justify-center font-display text-4xl lg:text-[64px] font-medium shadow-[0_0_0_6px_rgba(255,255,255,0.08),_0_20px_50px_rgba(0,0,0,0.25)] tracking-tight">
                  {initial}
                </div>
                {/* Online dot */}
                <div className="absolute bottom-1 right-1 lg:bottom-2 lg:right-2 w-4 h-4 lg:w-[22px] lg:h-[22px] rounded-full bg-[#7AB87E] shadow-[0_0_0_3px_#1F4744] lg:shadow-[0_0_0_4px_#1F4744]" />
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0 text-white">
                <p className="text-[11px] font-semibold text-white/55 uppercase tracking-[1.4px]">
                  Member since {fmtMemberSince(memberSince)}
                </p>
                <div className="flex items-baseline gap-2 lg:gap-3.5 mt-1.5 lg:mt-1 flex-wrap">
                  <h1 className="font-display text-3xl lg:text-[52px] font-medium tracking-tight lg:tracking-[-1.8px] leading-tight">
                    {name}
                  </h1>
                  <span className="hidden lg:inline font-display italic text-xl lg:text-[28px] text-gold tracking-tight">
                    · Patient one
                  </span>
                </div>

                <div className="hidden lg:flex items-center gap-4 mt-4 text-[13px] text-white/65 flex-wrap">
                  <span className="inline-flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="rgba(255,255,255,0.55)" strokeWidth="1.7" strokeLinecap="round" />
                      <circle cx="12" cy="7" r="4" stroke="rgba(255,255,255,0.55)" strokeWidth="1.7" />
                    </svg>
                    {email}
                  </span>
                  <span className="w-[3px] h-[3px] rounded-full bg-white/30" />
                  <span className="inline-flex items-center gap-1.5">
                    <Users size={14} strokeWidth={1.7} className="text-white/55" />
                    {groupsCount} {groupsCount === 1 ? 'group' : 'groups'}
                  </span>
                </div>
              </div>

              {/* Desktop actions */}
              <div className="hidden lg:flex flex-col gap-2.5 items-end">
                <Link
                  href="/settings"
                  className="h-10 px-[18px] rounded-xl bg-white/[0.14] backdrop-blur-sm text-white text-[13px] font-semibold inline-flex items-center gap-2 hover:bg-white/[0.22] transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M14 4l6 6-11 11H3v-6L14 4z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
                  </svg>
                  Edit income
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ STAT STRIP ═══ */}
        <div className="relative z-[2] mx-5 lg:mx-12 -mt-10 bg-card rounded-2xl shadow-pop overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            <StatCell
              label="Saved by waiting"
              value={
                <>
                  <span className="text-lg lg:text-[22px] text-primary tracking-tight">RM </span>
                  {(savedCents / 100).toLocaleString('en-MY', { maximumFractionDigits: 0 })}
                </>
              }
              accent="primary"
              border
            />
            <StatCell label="Items skipped" value={skippedCount} accent="text" border />
            <StatCell label="Skip rate" value={`${skipRatePct}%`} accent="text" border />
            <StatCell
              label="Hours reclaimed"
              value={lifeHours != null ? fmtHours(lifeHours) : '—'}
              accent="gold"
            />
          </div>
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="px-5 lg:px-12 pt-8 lg:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 lg:gap-8">
          {/* LEFT COLUMN — Personal records */}
          <div className="space-y-8">
            {/* Personal records */}
            <section>
              <h2 className="mb-4 font-display text-2xl font-medium tracking-tight text-foreground">
                Personal records
              </h2>
              <Card padding="none">
                <RecordRow
                  label="Biggest single skip"
                  value={biggestSaveCents > 0 ? fmtRM(biggestSaveCents, 0) : '—'}
                  caption={biggestSaveTitle}
                  accent="primary"
                />
                <RecordRow
                  label="Average save"
                  value={avgSaveCents > 0 ? fmtRM(avgSaveCents, 0) : '—'}
                  caption={`Across ${skippedCount} skipped items`}
                  accent="text"
                />
                <RecordRow
                  label="Total decisions"
                  value={skippedCount + boughtCount}
                  caption={`${coolingCount} still cooling`}
                  accent="gold"
                  last
                />
              </Card>
            </section>

            {/* Mobile-only info card */}
            <section className="lg:hidden">
              <Card padding="none">
                <div className="px-5 py-4 flex items-center gap-3 border-b border-sep">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="var(--text-muted)" strokeWidth="1.7" strokeLinecap="round" />
                    <circle cx="12" cy="7" r="4" stroke="var(--text-muted)" strokeWidth="1.7" />
                  </svg>
                  <span className="text-sm text-muted-foreground">{email}</span>
                </div>
                <div className="px-5 py-4 flex items-center gap-3">
                  <Users size={16} strokeWidth={1.7} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {groupsCount} {groupsCount === 1 ? 'group' : 'groups'}
                  </span>
                </div>
              </Card>
            </section>
          </div>

          {/* RIGHT COLUMN — Activity + Account */}
          <div className="space-y-8">
            {/* Recent activity */}
            <section>
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="font-display text-2xl font-medium tracking-tight text-foreground">
                  Recent activity
                </h2>
                <Link
                  href="/cooling"
                  className="text-[13px] font-semibold text-primary inline-flex items-center gap-1 hover:underline"
                >
                  See all <ArrowRight size={14} strokeWidth={2} />
                </Link>
              </div>
              <Card padding="none">
                {recentActivity.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                    No activity yet. Start logging temptations!
                  </div>
                ) : (
                  recentActivity.map((item, i) => {
                    const isSaved = item.status === 'SKIPPED'
                    const isLast = i === recentActivity.length - 1
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          'flex items-start gap-3.5 px-5 py-4',
                          !isLast && 'border-b border-sep',
                        )}
                      >
                        <div
                          className={cn(
                            'flex-shrink-0 w-[34px] h-[34px] rounded-[10px] flex items-center justify-center',
                            isSaved ? 'bg-gold-tint text-gold-deep' : 'bg-coral-tint text-coral-deep',
                          )}
                        >
                          {isSaved ? (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path d="M5 12l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path d="M5 8h14l-1 12H6L5 8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                              <path d="M9 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-foreground truncate">
                            {isSaved ? 'Skipped' : 'Bought'} {item.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {isSaved ? 'Saved' : 'Spent'} {fmtRM(item.amountCents, 0)}
                          </p>
                        </div>
                        <span className="text-[11px] text-subtle-foreground font-medium whitespace-nowrap">
                          {relativeTime(item.resolvedAt)}
                        </span>
                      </div>
                    )
                  })
                )}
              </Card>
            </section>

            {/* Account */}
            <section>
              <h2 className="mb-4 font-display text-2xl font-medium tracking-tight text-foreground">
                Account
              </h2>
              <Card padding="none">
                <Link
                  href="/settings"
                  className="flex items-center gap-3.5 px-5 py-4 border-b border-sep hover:bg-foreground/[0.025] transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-foreground">Income settings</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Calibrate the &ldquo;hours of your life&rdquo; lens
                    </p>
                  </div>
                  <ChevronRight size={14} strokeWidth={1.8} className="text-subtle-foreground flex-shrink-0" />
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-3.5 px-5 py-4 border-b border-sep text-left hover:bg-foreground/[0.025] transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-foreground">Log out</p>
                      <p className="text-xs text-muted-foreground mt-0.5">On this device</p>
                    </div>
                    <LogOut size={14} strokeWidth={1.8} className="text-subtle-foreground flex-shrink-0" />
                  </button>
                </form>
                <button
                  type="button"
                  className="w-full flex items-center gap-3.5 px-5 py-4 text-left hover:bg-foreground/[0.025] transition-colors"
                  onClick={() => {
                    // Placeholder — would open confirm dialog in a future pass
                    if (window.confirm('Are you sure? This cannot be undone.')) {
                      alert('Account deletion would be handled server-side.')
                    }
                  }}
                >
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-coral-deep">Delete account</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Permanently remove your data
                    </p>
                  </div>
                  <ChevronRight size={14} strokeWidth={1.8} className="text-coral-deep flex-shrink-0" />
                </button>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Sub-components ─── */

function StatCell({
  label,
  value,
  accent,
  border,
}: {
  label: string
  value: React.ReactNode
  accent: 'primary' | 'text' | 'gold'
  border?: boolean
}) {
  const colorClass =
    accent === 'primary'
      ? 'text-primary'
      : accent === 'gold'
        ? 'text-gold-deep'
        : 'text-foreground'

  return (
    <div
      className={cn(
        'px-5 lg:px-6 py-5',
        border && 'border-r border-sep',
      )}
    >
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[1.2px]">
        {label}
      </p>
      <p
        className={cn(
          'font-display text-2xl lg:text-[32px] font-medium tracking-tight tabular-nums leading-tight mt-1.5',
          colorClass,
        )}
      >
        {value}
      </p>
    </div>
  )
}

function RecordRow({
  label,
  value,
  caption,
  accent = 'text',
  last,
}: {
  label: string
  value: React.ReactNode
  caption: string
  accent?: 'primary' | 'text' | 'gold'
  last?: boolean
}) {
  const colorClass =
    accent === 'primary'
      ? 'text-primary'
      : accent === 'gold'
        ? 'text-gold-deep'
        : 'text-foreground'

  return (
    <div
      className={cn(
        'flex items-center gap-4 lg:gap-5 px-5 lg:px-[22px] py-[18px]',
        !last && 'border-b border-sep',
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[1px]">
          {label}
        </p>
        <p className="text-[13px] text-muted-foreground mt-1.5 italic">{caption}</p>
      </div>
      <span
        className={cn(
          'font-display text-[28px] lg:text-[30px] font-medium tracking-tight tabular-nums flex-shrink-0',
          colorClass,
        )}
      >
        {value}
      </span>
    </div>
  )
}
