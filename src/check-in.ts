import type { Company, Energy, Mood } from './activity.ts'

export type CheckInCompany = Exclude<Company, 'any'>

export type CheckInSetting = 'indoor' | 'outdoor'

export type CheckIn = {
  energy: Energy
  mood: Mood
  company: CheckInCompany
  setting: CheckInSetting
}
