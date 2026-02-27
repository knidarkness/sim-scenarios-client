import { useState } from 'react'
import type { ActiveScenarioItem, ScenarioConditions } from '../types'

type ConditionKey = keyof ScenarioConditions

const CONDITION_LABELS: Record<ConditionKey, string> = {
  altitude: 'Altitude (MSL)',
  altitudeAgl: 'Altitude (AGL)',
  speed: 'Speed',
  landingGear: 'Landing Gear',
  flapPosition: 'Flap Position',
  navAidDistance: 'NavAid Distance',
}

const LANDING_GEAR_LABELS: Record<string, string> = { '0': 'Up', '1': 'Down' }
const FLAP_POSITION_LABELS: Record<string, string> = { '0': 'Up', '50': 'Partial', '100': 'Down' }

function resolveValue(key: ConditionKey, value: string | null): string | null {
  if (value === null) return null
  if (key === 'landingGear') return LANDING_GEAR_LABELS[value] ?? value
  if (key === 'flapPosition') return FLAP_POSITION_LABELS[value] ?? value
  return value
}

function EventRow({ event }: { event: ActiveScenarioItem }) {
  const activeConditions = (Object.keys(CONDITION_LABELS) as ConditionKey[])
    .map((key) => ({ key, label: CONDITION_LABELS[key], condition: event.conditions[key] }))
    .filter(({ condition }) => condition?.modifier !== null && condition?.value !== null)

  return (
    <div className="event-row">
      <div className="event-row-header">
        <span className="event-name">{event.name}</span>
        {!event.isActive && <span className="event-inactive-badge">inactive</span>}
      </div>

      {activeConditions.length > 0 ? (
        <ul className="event-conditions-list">
          {activeConditions.map(({ key, label, condition }) => (
            <li key={key} className="event-condition-item">
              <span className="event-condition-label">{label}</span>
              <span className="event-condition-sep">—</span>
              <span className="event-condition-value">
                {condition.modifier}{' '}
                {condition.value !== null && (
                  <strong>
                    {resolveValue(key, condition.value)}
                    {key === 'navAidDistance' ? ' nm' : ''}
                  </strong>
                )}
                {'text' in condition && condition.text ? (
                  <> from <strong>{condition.text}</strong></>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="event-no-conditions">No trigger conditions set</p>
      )}
    </div>
  )
}

interface SpoilersSectionProps {
  events: ActiveScenarioItem[]
}

export function SpoilersSection({ events }: SpoilersSectionProps) {
  const [revealed, setRevealed] = useState(false)

  if (!revealed) {
    return (
      <div className="spoilers-section">
        <div className="spoilers-warning">
          <div>
            <p className="spoilers-warning-title">Event details are hidden</p>
            <p className="spoilers-warning-text">
              Revealing this will show each event's name and trigger conditions — which may spoil
              the training experience. Only proceed if you're sure.
            </p>
          </div>
          <button
            type="button"
            className="spoilers-reveal-button"
            onClick={() => setRevealed(true)}
          >
            Show event details (spoilers)
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="spoilers-section">
      <div className="spoilers-list-header">
        <h2 className="spoilers-list-title">Events ({events.length})</h2>
        <button
          type="button"
          className="spoilers-hide-button"
          onClick={() => setRevealed(false)}
        >
          Hide
        </button>
      </div>
      <div className="spoilers-events-list">
        {events.map((event, i) => (
          <EventRow key={event.name + i} event={event} />
        ))}
      </div>
    </div>
  )
}
