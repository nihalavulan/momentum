import { useState, type ReactNode } from 'react'
import { addDays, formatMonthYear, parseISODate, startOfWeek, weekDays, type ISODate } from '../../lib/dates.ts'
import { ChevronLeftIcon, ChevronRightIcon } from '../../components/ui/icons.tsx'

interface DayProgress {
  done: number
  total: number
}

const RING_R = 19
const RING_C = 2 * Math.PI * RING_R

/**
 * The week at a glance: each day carries a ring that fills (primary) as its
 * Moves get done. Tap a day to see its Moves.
 */
export function WeekStrip({
  selected,
  today,
  progressFor,
  onSelect,
}: {
  selected: ISODate
  today: ISODate
  progressFor: (day: ISODate) => DayProgress
  onSelect: (day: ISODate) => void
}) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(selected))
  // Follow the selection when it changes from outside (e.g. "Back to today").
  const [prevSelected, setPrevSelected] = useState(selected)
  if (selected !== prevSelected) {
    setPrevSelected(selected)
    setWeekStart(startOfWeek(selected))
  }
  const days = weekDays(weekStart)

  return (
    <section aria-label="Week">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[14px] font-semibold text-ink">{formatMonthYear(days[3])}</p>
        <div className="flex items-center gap-1">
          <StepButton label="Previous week" onClick={() => setWeekStart((w) => addDays(w, -7))}>
            <ChevronLeftIcon size={18} strokeWidth={2} />
          </StepButton>
          <StepButton label="Next week" onClick={() => setWeekStart((w) => addDays(w, 7))}>
            <ChevronRightIcon size={18} strokeWidth={2} />
          </StepButton>
        </div>
      </div>

      <ol className="grid grid-cols-7">
        {days.map((day) => {
          const d = parseISODate(day)
          const { done, total } = progressFor(day)
          const isSelected = day === selected
          const isToday = day === today
          const ratio = total ? done / total : 0
          const weekday = d.toLocaleDateString('en-GB', { weekday: 'short' })
          const label = `${d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}${
            total ? `, ${done} of ${total} done` : ''
          }`

          return (
            <li key={day} className="flex justify-center">
              <button
                type="button"
                onClick={() => onSelect(day)}
                aria-pressed={isSelected}
                aria-label={label}
                className="group flex flex-col items-center gap-1.5 rounded-2xl px-1 py-1.5 outline-none focus-visible:bg-surface"
              >
                <span className={`text-[12px] font-medium ${isSelected ? 'text-ink' : 'text-ink-3'}`}>
                  {weekday.slice(0, 1)}
                  <span className="hidden lg:inline">{weekday.slice(1, 3)}</span>
                </span>
                <span className="relative grid size-11 place-items-center">
                  <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90" aria-hidden>
                    {total > 0 && (
                      <circle cx="22" cy="22" r={RING_R} fill="none" stroke="var(--color-line)" strokeWidth="2.5" />
                    )}
                    {done > 0 && (
                      <circle
                        cx="22"
                        cy="22"
                        r={RING_R}
                        fill="none"
                        stroke="var(--color-primary)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeDasharray={RING_C}
                        strokeDashoffset={RING_C * (1 - ratio)}
                        className="transition-[stroke-dashoffset] duration-300 ease-out"
                      />
                    )}
                  </svg>
                  <span
                    className={[
                      'relative grid size-[30px] place-items-center rounded-full text-[14px] tabular-nums transition-colors duration-150',
                      isSelected
                        ? 'bg-ink font-semibold text-white'
                        : isToday
                          ? 'font-bold text-primary'
                          : 'font-medium text-ink group-hover:bg-surface',
                    ].join(' ')}
                  >
                    {d.getDate()}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function StepButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-8 place-items-center rounded-full text-ink-2 outline-none hover:bg-surface hover:text-ink focus-visible:bg-surface"
    >
      {children}
    </button>
  )
}
