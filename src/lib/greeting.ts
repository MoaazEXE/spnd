export function buildGreeting(name: string): string {
  const hour = new Date().getHours()
  const time = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  const first = name.split(' ')[0]
  return `Good ${time}, ${first}`
}

export function buildDateLabel(locale = 'en-MY'): string {
  return new Date().toLocaleDateString(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}
