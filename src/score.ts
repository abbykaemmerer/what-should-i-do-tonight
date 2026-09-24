import type { Activity, Energy } from './activity.ts'
import type { CheckIn } from './check-in.ts'

const energyLevels: Energy[] = ['low', 'medium', 'high']

// Each matching signal is worth 2. A neighboring energy level is worth 1.
// A company of "any" matches every check-in.
const exactMatchPoints = 2
const nearEnergyPoints = 1

export function scoreActivity(activity: Activity, checkIn: CheckIn): number {
  return (
    energyPoints(activity.energy, checkIn.energy) +
    moodPoints(activity, checkIn) +
    companyPoints(activity, checkIn)
  )
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

export type ScoredActivity = {
  activity: Activity
  score: number
}

// Highest score first. Equal scores keep the earlier activity id so the
// order does not change between runs.
export function recommend(
  activities: Activity[],
  checkIn: CheckIn,
): ScoredActivity[] {
  return activities
    .map((activity) => ({
      activity,
      score: scoreActivity(activity, checkIn),
    }))
    .sort((a, b) => b.score - a.score || a.activity.id - b.activity.id)
    .slice(0, 3)
}
