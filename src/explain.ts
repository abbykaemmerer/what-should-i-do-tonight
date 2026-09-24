import type { CheckIn } from './check-in.ts'

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

export function explain(checkIn: CheckIn): string {
  return `You have ${energyLabel[checkIn.energy]}, you feel ${checkIn.mood}, and ${companyLabel[checkIn.company]}. This matches that.`
}
