import type { Weather } from './activity.ts'

const austin = { latitude: 30.2672, longitude: -97.7431 }

export type TonightContext = {
  temperature: number
  conditions: Weather[]
  sunset: Date
  daylightMinutes: number
}

type Forecast = {
  current: {
    temperature_2m: number
    precipitation_probability: number
    weather_code: number
  }
  daily: {
    sunset: string[]
  }
}

export async function loadContext(now = new Date()): Promise<TonightContext> {
  const params = new URLSearchParams({
    latitude: String(austin.latitude),
    longitude: String(austin.longitude),
    current: 'temperature_2m,precipitation_probability,weather_code',
    daily: 'sunset',
    temperature_unit: 'fahrenheit',
    timezone: 'America/Chicago',
    forecast_days: '1',
  })
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
  if (!response.ok) throw new Error('Weather request failed')
  const forecast = (await response.json()) as Forecast
  const sunset = new Date(forecast.daily.sunset[0])
  const daylightMinutes = Math.max(0, Math.round((sunset.getTime() - now.getTime()) / 60000))

  return {
    temperature: Math.round(forecast.current.temperature_2m),
    conditions: conditionsFor(forecast),
    sunset,
    daylightMinutes,
  }
}

function conditionsFor(forecast: Forecast): Weather[] {
  const { precipitation_probability: rainChance, weather_code: code, temperature_2m: temperature } =
    forecast.current
  const raining = rainChance >= 40 || isRainCode(code)
  const conditions: Weather[] = [raining ? 'rain' : 'clear']

  if (temperature >= 90) conditions.push('hot')
  if (temperature <= 55) conditions.push('cold')
  return conditions
}

function isRainCode(code: number): boolean {
  return (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95
}
