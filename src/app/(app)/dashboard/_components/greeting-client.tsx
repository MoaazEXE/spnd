'use client'

import { useEffect, useState } from 'react'

function buildGreeting(name: string): string {
  const hour = new Date().getHours()
  const time = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  return `Good ${time}, ${name.split(' ')[0]}`
}

function buildDateLabel(): string {
  return new Date().toLocaleDateString('en-MY', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

interface Props {
  name: string
  initialGreeting: string
  initialDate: string
}

export function GreetingClient({ name, initialGreeting, initialDate }: Props) {
  const [greeting, setGreeting] = useState(initialGreeting)
  const [date, setDate] = useState(initialDate)

  useEffect(() => {
    setGreeting(buildGreeting(name))
    setDate(buildDateLabel())
  }, [name])

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{date}</p>
      <h1 className="mt-0.5 font-display text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
        {greeting}
      </h1>
    </div>
  )
}
