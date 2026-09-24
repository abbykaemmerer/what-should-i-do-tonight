import type { Company, Energy, Mood } from './activity.ts'

export type CheckInCompany = Exclude<Company, 'any'>

export type CheckIn = {
  energy: Energy
  mood: Mood
  company: CheckInCompany
}
