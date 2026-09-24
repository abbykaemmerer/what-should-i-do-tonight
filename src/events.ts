import type { Activity, Energy, Movement } from './activity.ts'

const seatedVenues = [
  'moody center',
  'moody amphitheater',
  'bass concert hall',
  'acl live',
  'paramount theatre',
  'stateside at the paramount',
  'the long center',
]

const standingVenues = [
  'continental club',
  'hole in the wall',
  "buck's backyard",
  "oilcan harry's",
  'hotel vegas',
  'mohawk',
  'scoot inn',
  'the concourse project',
  "emo's",
  "antone's",
  'cheer up charlies',
  'barbarella',
]

const drinkPattern =
  /\b(drink|beer|cocktail|jello|lone star|wine|margarita|shots?)\b/i

const promoPattern = /\b(bogo|use code|%\s*off)\b/i

type Do512Event = {
  id: number
  title: string
  category_param: string
  begin_time: string
  is_free: boolean
  sold_out: boolean
  past: boolean
  ticket_info: string
  venue: { title: string } | null
}

type Do512Response = {
  events: Do512Event[]
}

export type Tonight = {
  events: Activity[]
}

export async function loadTonight(): Promise<Tonight> {
  const response = await fetch('/do512/events.json')
  if (!response.ok) throw new Error('Do512 request failed')
  const data = (await response.json()) as Do512Response
  return tonightFromDo512(data.events ?? [])
}

export function tonightFromDo512(events: Do512Event[]): Tonight {
  const tonight = events.filter((event) => isTonight(event) && !event.sold_out)
  const plans = tonight.filter((event) => !isDrinkSpecial(event) && !isPromo(event))

  return {
    events: plans.flatMap(toActivity),
  }
}

function toActivity(event: Do512Event): Activity[] {
  const kind = kindFor(event)
  if (!kind) return []

  const venue = event.venue?.title ?? 'Austin'
  const when = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(event.begin_time))

  return [
    {
      id: event.id,
      name: event.title,
      description: `${venue} at ${when}.`,
      energy: kind.energy,
      moods: kind.energy === 'low' ? ['social'] : ['social', 'adventurous'],
      company: 'any',
      setting: 'either',
      movement: kind.movement,
      cost: event.is_free ? 'free' : 'low',
      needsDaylight: false,
      weather: ['clear', 'hot', 'cold', 'rain'],
      tonight: true,
    },
  ]
}

function kindFor(event: Do512Event): { energy: Energy; movement: Movement } | null {
  const category = event.category_param
  const venue = event.venue?.title.toLowerCase() ?? ''

  if (category === 'theatre-performing-arts' || category === 'film-drive-in-s') {
    return { energy: 'low', movement: 'still' }
  }

  if (seatedVenues.some((name) => venue.includes(name))) {
    return { energy: 'medium', movement: 'still' }
  }

  if (
    category === 'dj-s-parties' ||
    category === 'live-music' ||
    standingVenues.some((name) => venue.includes(name))
  ) {
    return { energy: 'high', movement: 'active' }
  }

  return null
}

function isDrinkSpecial(event: Do512Event): boolean {
  return drinkPattern.test(`${event.title} ${event.ticket_info}`)
}

function isPromo(event: Do512Event): boolean {
  return promoPattern.test(`${event.title} ${event.ticket_info}`)
}

function isTonight(event: Do512Event): boolean {
  if (event.past || !event.begin_time) return false
  const format = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return format.format(new Date(event.begin_time)) === format.format(new Date())
}
