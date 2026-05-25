'use client'

import { useEffect, useState } from 'react'

/**
 * Shared per-second tick. ONE module-level interval per requested cadence
 * drives every subscriber at that cadence, so N CoolingCards on screen pay
 * for one timer + one Date.now() per tick, not N. Each consumer still
 * re-renders independently when its `now` changes.
 *
 * Components asking for different intervals share their own timer per value.
 */
interface Channel {
  subs: Set<(now: Date) => void>
  timer: ReturnType<typeof setInterval> | null
}

const channels = new Map<number, Channel>()

function subscribe(intervalMs: number, fn: (now: Date) => void) {
  let ch = channels.get(intervalMs)
  if (!ch) {
    ch = { subs: new Set(), timer: null }
    channels.set(intervalMs, ch)
  }
  ch.subs.add(fn)
  if (ch.timer == null) {
    ch.timer = setInterval(() => {
      const now = new Date()
      ch!.subs.forEach(f => f(now))
    }, intervalMs)
  }
}

function unsubscribe(intervalMs: number, fn: (now: Date) => void) {
  const ch = channels.get(intervalMs)
  if (!ch) return
  ch.subs.delete(fn)
  if (ch.subs.size === 0 && ch.timer != null) {
    clearInterval(ch.timer)
    ch.timer = null
    channels.delete(intervalMs)
  }
}

export function useTick(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    subscribe(intervalMs, setNow)
    return () => unsubscribe(intervalMs, setNow)
  }, [intervalMs])
  return now
}
