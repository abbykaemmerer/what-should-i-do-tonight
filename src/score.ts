import type { Activity, Energy } from './activity.ts'
import type { CheckIn } from './check-in.ts'
import type { TonightContext } from './context.ts'

const energyLevels: Energy[] = ['low', 'medium', 'high']

// Each matching signal is worth 2. A neighboring energy level is worth 1.
// A company of "any" matches every check-in.
const exactMatchPoints = 2
const nearEnergyPoints = 1

export type Factors = {
  energy: number
  mood: number
  company: number
  weather: number
  daylight: number
}

export function scoreActivity(
  activity: Activity,
  checkIn: CheckIn,
  context?: TonightContext | null,
): { score: number; factors: Factors } {
  const factors = {
    energy: energyPoints(activity.energy, checkIn.energy),
    mood: moodPoints(activity, checkIn),
    company: companyPoints(activity, checkIn),
    weather: context ? weatherPoints(activity, context) : 0,
    daylight: context ? daylightPoints(activity, context) : 0,
  }

  return {
    score: factors.energy + factors.mood + factors.company + factors.weather + factors.daylight,
    factors,
  }
}

function energyPoints(activityEnergy: Energy, checkInEnergy: Energy): number {
  const distance = Math.abs(
    energyLevels.indexOf(activityEnergy) - energyLevels.indexOf(checkInEnergy),
  )

  if (distance === 0) return exactMatchPoints
  if (distance === 1) return nearEnergyPoints
  return 0
}

function moodPoints(activity: Activity, checkIn: CheckIn): number {
  return activity.moods.includes(checkIn.mood) ? exactMatchPoints : 0
}

function companyPoints(activity: Activity, checkIn: CheckIn): number {
  const matches =
    activity.company === 'any' || activity.company === checkIn.company

  return matches ? exactMatchPoints : 0
}

function weatherPoints(activity: Activity, context: TonightContext): number {
  return context.conditions.reduce((total, condition) => {
    if (activity.weather.includes(condition)) return total + exactMatchPoints
    const harsh = condition === 'rain' || condition === 'hot' || condition === 'cold'
    if (harsh && activity.setting === 'outdoor') return total - exactMatchPoints
    return total
  }, 0)
}

function daylightPoints(activity: Activity, context: TonightContext): number {
  if (!activity.needsDaylight) return 0
  return context.daylightMinutes >= 60 ? exactMatchPoints : -exactMatchPoints
}

export type ScoredActivity = {
  activity: Activity
  score: number
  factors: Factors
}

// Highest score first. A tonight event beats a tied local activity, then
// the earlier id wins so the order stays stable.
export function recommend(
  activities: Activity[],
  checkIn: CheckIn,
  context?: TonightContext | null,
): ScoredActivity[] {
  return activities
    .map((activity) => ({
      activity,
      ...scoreActivity(activity, checkIn, context),
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(Boolean(b.activity.tonight)) - Number(Boolean(a.activity.tonight)) ||
        a.activity.id - b.activity.id,
    )
    .slice(0, 3)
}
