export type Energy = 'low' | 'medium' | 'high'

export type Mood = 'chill' | 'social' | 'playful' | 'adventurous' | 'cozy' | 'restless'

export type Company = 'solo' | 'date' | 'friends' | 'any'

export type Setting = 'indoor' | 'outdoor' | 'either'

export type Movement = 'still' | 'light' | 'active'

export type Cost = 'free' | 'low' | 'splurge'

export type Weather = 'clear' | 'hot' | 'cold' | 'rain'

export type Activity = {
  id: number
  name: string
  description: string
  energy: Energy
  moods: Mood[]
  company: Company
  setting: Setting
  movement: Movement
  cost: Cost
  needsDaylight: boolean
  weather: Weather[]
  tonight?: boolean
}
