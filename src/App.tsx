import { useState } from 'react'
import './App.css'
import { activities } from './activities.ts'
import type { Energy, Mood } from './activity.ts'
import type { CheckIn, CheckInCompany, CheckInSetting } from './check-in.ts'
import { loadContext, type TonightContext } from './context.ts'
import { explain } from './explain.ts'
import { loadTonight } from './events.ts'
import { happyHourLine } from './happy-hours.ts'
import { moonNote } from './moon.ts'
import { recommend, type ScoredActivity } from './score.ts'

const energyOptions: Energy[] = ['low', 'medium', 'high']
const moodOptions: Mood[] = ['chill', 'social', 'playful', 'adventurous', 'cozy', 'restless']
const companyOptions: { value: CheckInCompany; label: string }[] = [
  { value: 'solo', label: 'Solo' },
  { value: 'date', label: 'With Eric' },
  { value: 'friends', label: 'Friends' },
]
const settingOptions: { value: CheckInSetting; label: string }[] = [
  { value: 'indoor', label: 'Inside' },
  { value: 'outdoor', label: 'Outside' },
]

function App() {
  const [energy, setEnergy] = useState<Energy | null>(null)
  const [mood, setMood] = useState<Mood | null>(null)
  const [company, setCompany] = useState<CheckInCompany | null>(null)
  const [setting, setSetting] = useState<CheckInSetting | null>(null)
  const [picks, setPicks] = useState<ScoredActivity[] | null>(null)
  const [context, setContext] = useState<TonightContext | null>(null)
  const [showBackups, setShowBackups] = useState(false)
  const [loading, setLoading] = useState(false)
  const [eventsMissing, setEventsMissing] = useState(false)
  const [weatherMissing, setWeatherMissing] = useState(false)
  const [shown, setShown] = useState<string[]>([])

  const ready = energy !== null && mood !== null && company !== null && setting !== null

  async function submit() {
    if (!energy || !mood || !company || !setting || loading) return
    const checkIn: CheckIn = { energy, mood, company, setting }
    setLoading(true)
    const [tonight, tonightContext] = await Promise.all([
      loadTonight().catch(() => null),
      loadContext().catch(() => null),
    ])
    const tonightEvents = tonight ? [...activities, ...tonight.events] : activities
    setPicks(recommend(tonightEvents, checkIn, tonightContext, shown))
    setContext(tonightContext)
    setEventsMissing(tonight === null)
    setWeatherMissing(tonightContext === null)
    setShowBackups(false)
    setLoading(false)
  }

  const primary = picks?.[0]

  function reset() {
    if (primary) setShown((names) => [...names, primary.activity.name])
    setPicks(null)
    setContext(null)
    setEventsMissing(false)
    setWeatherMissing(false)
    setShowBackups(false)
  }

  const checkIn: CheckIn | null =
    energy && mood && company && setting ? { energy, mood, company, setting } : null
  const backups = picks?.slice(1, 3) ?? []
  const moon = primary ? moonNote(primary.activity.setting) : null

  return (
    <main className={primary && checkIn ? 'app result-page' : 'app'}>
      <p className="eyebrow">Tonight</p>
      <h1>What should I do tonight?</h1>

      {primary && checkIn ? (
        <section className="result">
          <p className="kicker">Do this</p>
          <h2>{primary.activity.name}</h2>
          <p className="description">{descriptionFor(primary.activity)}</p>
          <p className="why">{explain(checkIn, primary.factors, context)}</p>
          {moon ? <p className="notice">{moon}</p> : null}
          {eventsMissing ? (
            <p className="notice">Tonight's shows didn't load. This is from the local list.</p>
          ) : null}
          {weatherMissing ? (
            <p className="notice">Weather didn't load, so this ignores the sky.</p>
          ) : null}
          {showBackups ? (
            <div className="backups">
              <p className="kicker">If not that</p>
              <ul>
                {backups.map((pick) => (
                  <li key={pick.activity.id}>
                    <h3>{pick.activity.name}</h3>
                    <p>{descriptionFor(pick.activity)}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <button type="button" className="text-button" onClick={() => setShowBackups(true)}>
              I'm not feeling that
            </button>
          )}
          <button type="button" className="text-button" onClick={reset}>
            Start over
          </button>
        </section>
      ) : (
        <form
          className="check-in"
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
        >
          <ChoiceGroup legend="Energy" options={energyOptions} value={energy} onChange={setEnergy} />
          <ChoiceGroup legend="Mood" options={moodOptions} value={mood} onChange={setMood} />
          <fieldset className="choices">
            <legend>Who's with you</legend>
            <div className="options">
              {companyOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={company === option.value}
                  onClick={() => setCompany(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="choices">
            <legend>Inside or outside</legend>
            <div className="options">
              {settingOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={setting === option.value}
                  onClick={() => setSetting(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
          <button type="submit" className="submit" disabled={!ready || loading}>
            {loading ? 'Checking tonight…' : 'Tell me'}
          </button>
        </form>
      )}
    </main>
  )
}

function descriptionFor(activity: { id: number; description: string }): string {
  const happyHour = happyHourLine(activity.id)
  return happyHour ? `${activity.description} ${happyHour}` : activity.description
}

function ChoiceGroup<T extends string>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string
  options: T[]
  value: T | null
  onChange: (value: T) => void
}) {
  return (
    <fieldset className="choices">
      <legend>{legend}</legend>
      <div className="options">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export default App
