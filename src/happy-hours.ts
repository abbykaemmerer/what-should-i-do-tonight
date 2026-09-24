// A short map from the ATX FYI happy hour guide onto the drink plans
// already in the activity list. This is not a live happy-hour feed.

type HappyHour = {
  activityId: number
  name: string
  days: Array<'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'>
  start: number
  end: number
  detail: string
}

// Areas are limited to central, east, south, and west.
const happyHours: HappyHour[] = [
  {
    activityId: 7,
    name: 'De Nada Cantina',
    days: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    start: 15 * 60 + 30,
    end: 18 * 60 + 30,
    detail: '$1 off drinks on the east side patio',
  },
  {
    activityId: 7,
    name: 'Easy Tiger on South Lamar',
    days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    start: 14 * 60 + 30,
    end: 18 * 60,
    detail: '$5 drinks and bites',
  },
  {
    activityId: 7,
    name: 'Lazarus Brewing',
    days: ['mon', 'tue', 'wed', 'thu'],
    start: 16 * 60,
    end: 18 * 60,
    detail: '$2 Time Machine lagers',
  },
  {
    activityId: 13,
    name: 'Hole in the Wall',
    days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    start: 15 * 60,
    end: 20 * 60,
    detail: 'select drink specials',
  },
  {
    activityId: 13,
    name: 'Café No Sé',
    days: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    start: 15 * 60,
    end: 18 * 60,
    detail: '$2 off drinks on South Congress',
  },
]

const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const

export function happyHourLine(activityId: number, now = new Date()): string | null {
  const place = happyHours.find(
    (hour) => hour.activityId === activityId && isOpen(hour, now),
  )
  if (!place) return null
  return `${place.name} is in happy hour until ${formatMinutes(place.end)}: ${place.detail}.`
}

function isOpen(hour: HappyHour, now: Date): boolean {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const weekday = parts.find((part) => part.type === 'weekday')?.value.slice(0, 3).toLowerCase()
  const hours = Number(parts.find((part) => part.type === 'hour')?.value)
  const minutes = Number(parts.find((part) => part.type === 'minute')?.value)
  const clock = hours * 60 + minutes
  return weekdays.includes(weekday as (typeof weekdays)[number]) &&
    hour.days.includes(weekday as HappyHour['days'][number]) &&
    clock >= hour.start &&
    clock < hour.end
}

function formatMinutes(minutes: number): string {
  const date = new Date(Date.UTC(2026, 0, 1, Math.floor(minutes / 60), minutes % 60))
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(date)
}
