import type { CheckIn } from './check-in.ts'
import type { TonightContext } from './context.ts'
import type { Factors } from './score.ts'

const energyLabel = {
  low: 'low energy',
  medium: 'medium energy',
  high: 'high energy',
} as const

const companyLabel = {
  solo: "you're on your own",
  date: "you're with Eric",
  friends: "you're with friends",
} as const

export function explain(
  checkIn: CheckIn,
  factors: Factors,
  context?: TonightContext | null,
): string {
  const parts: string[] = []

  if (context && factors.weather !== 0) {
    const sky = context.conditions.includes('rain') ? 'rainy' : 'clear'
    const extreme = context.conditions.includes('hot')
      ? 'hot'
      : context.conditions.includes('cold')
        ? 'cold'
        : null
    parts.push(extreme ? `It's ${extreme} and ${sky}` : `It's ${sky}`)
  }

  if (context && factors.daylight !== 0) {
    const sunset = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      hour: 'numeric',
      minute: '2-digit',
    }).format(context.sunset)
    parts.push(
      factors.daylight > 0
        ? `sunset isn't until ${sunset}`
        : `sunset was at ${sunset}`,
    )
  }

  const aboutYou: string[] = []
  if (factors.energy > 0) aboutYou.push(`you have ${energyLabel[checkIn.energy]}`)
  if (factors.mood > 0) aboutYou.push(`you feel ${checkIn.mood}`)
  if (factors.company > 0) aboutYou.push(companyLabel[checkIn.company])
  if (factors.setting > 0) {
    aboutYou.push(checkIn.setting === 'outdoor' ? 'you want to be outside' : 'you want to be inside')
  }
  if (aboutYou.length > 0) parts.push(joinList(aboutYou))

  if (parts.length === 0) return 'This is the closest match for tonight.'
  const text = parts
    .map((part, index) => (index === 0 ? part : capitalize(part)))
    .join('. ')
  return `${text}. This matches that.`
}

function joinList(items: string[]): string {
  if (items.length === 1) return items[0]
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
