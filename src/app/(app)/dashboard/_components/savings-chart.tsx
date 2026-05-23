'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { SavingsDataPoint } from '@/core/savings/savings'

interface Props {
  data: SavingsDataPoint[]
}

function fmtShortDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })
}

function fmtRM(cents: number) {
  return `RM ${(cents / 100).toFixed(2)}`
}

export function SavingsChart({ data }: Props) {
  const allZero = data.every(p => p.cumulativeCents === 0)

  if (allZero) {
    return (
      <section className="px-5 mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.4px] text-muted-foreground mb-3">
          Savings over time
        </p>
        <div className="h-[120px] flex items-center justify-center rounded-2xl bg-secondary/40">
          <p className="text-[13px] text-muted-foreground/60">Your savings will appear here</p>
        </div>
      </section>
    )
  }

  const chartData = data.map(p => ({
    date: p.date,
    label: fmtShortDate(p.date),
    value: p.cumulativeCents,
  }))

  // Show only a few x-axis labels to avoid clutter
  const stride = Math.ceil(chartData.length / 4)
  const tickDates = new Set(
    chartData
      .filter((_, i) => i % stride === 0 || i === chartData.length - 1)
      .map(p => p.date)
  )

  return (
    <section className="px-5 mb-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.4px] text-muted-foreground mb-3">
        Savings over time
      </p>
      <div className="h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0F766E" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#0F766E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickFormatter={d => tickDates.has(d) ? fmtShortDate(d) : ''}
              interval={0}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: '#1c2a27',
                border: 'none',
                borderRadius: 10,
                fontSize: 13,
                color: '#f0faf9',
              }}
              formatter={(v) => [fmtRM(Number(v)), 'Saved']}
              labelFormatter={(l) => fmtShortDate(String(l))}
              cursor={{ stroke: '#0F766E', strokeWidth: 1, strokeDasharray: '4 2' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#0F766E"
              strokeWidth={2}
              fill="url(#savingsGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#F59E0B', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
