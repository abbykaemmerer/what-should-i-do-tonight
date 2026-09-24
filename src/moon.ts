import type { Setting } from './activity.ts'

// Full moon on September 26, 2026 at 16:50 UTC. The score does not use this.
const fullMoon = Date.parse('2026-09-26T16:50:00Z')
const newMoon = Date.parse('2026-09-11T03:27:00Z')
const synodicMs = 29.530588 * 86_400_000

export function moonNote(setting: Setting, now = new Date()): string | null {
  if (setting === 'indoor') return null

  const fromFull = daysFrom(now, fullMoon)
  const fromNew = daysFrom(now, newMoon)

  if (fromFull < 0.6) return 'The moon is full tonight.'
  if (fromNew < 0.6) return 'The moon is new tonight, so the sky will be dark.'
  if (fromFull < 2.5) return 'The moon is nearly full.'
  return null
}

function daysFrom(now: Date, anchor: number): number {
  const delta = Math.abs(now.getTime() - anchor)
  const wrapped = delta % synodicMs
  return Math.min(wrapped, synodicMs - wrapped) / 86_400_000
}
