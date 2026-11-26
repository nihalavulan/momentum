import { useState, type ReactNode } from 'react'
import { addDays, formatMonthYear, parseISODate, toISODate, type ISODate } from '../../lib/dates.ts'
import { ChevronLeftIcon, ChevronRightIcon } from './icons.tsx'

const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function firstOfMonth(iso: ISODate): ISODate {
  const d = parseISODate(iso)
  return toISODate(new Date(d.getFullYear(), d.getMonth(), 1))
}

function shiftMonth(iso: ISODate, by: number): ISODate {
  const d = parseISODate(iso)
  return toISODate(new Date(d.getFullYear(), d.getMonth() + by, 1))
}

/**
 * Month grid (Monday first) for picking a day. Days before `minDate` are
 * disabled. Same visual language as the week strip: today in primary,
 * the selected day as a solid ink circle.
 */
export function MonthCalendar({
  selected,
  today,
  minDate = today,
  onSelect,
}: {
  selected: ISODate | null
  today: ISODate
  minDate?: ISODate
  onSelect: (day: ISODate) => void
}) {
  const [month, setMonth] = useState(() => firstOfMonth(selected ?? today))
  const first = parseISODate(month)
  const leading = (first.getDay() + 6) % 7
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const cells: (ISODate | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => addDays(month, i)),
  ]
  const canGoBack = month > firstOfMonth(minDate)

  return (
    <div className="w-full max-w-[320px]">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[14px] font-semibold text-ink">{formatMonthYear(month)}</p>
        <div className="flex gap-1">
          <NavButton label="Previous month" disabled={!canGoBack} onClick={() => setMonth((m) => shiftMonth(m, -1))}>
            <ChevronLeftIcon size={18} strokeWidth={2} />
          </NavButton>
          <NavButton label="Next month" onClick={() => setMonth((m) => shiftMonth(m, 1))}>
            <ChevronRightIcon size={18} strokeWidth={2} />
          </NavButton>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-[12px] font-medium text-ink-3" aria-hidden>
        {WEEKDAY_LETTERS.map((l, i) => (
          <span key={i} className="py-1">
            {l}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7" role="grid" aria-label={formatMonthYear(month)}>
        {cells.map((day, i) =>
          day === null ? (
            <span key={`blank-${i}`} />
          ) : (
            <DayCell
              key={day}
              day={day}
              isToday={day === today}
              isSelected={day === selected}
              disabled={day < minDate}
              onSelect={onSelect}
            />
          ),
        )}
      </div>
    </div>
  )
}

function DayCell({
  day,
  isToday,
  isSelected,
  disabled,
  onSelect,
}: {
  day: ISODate
  isToday: boolean
  isSelected: boolean
  disabled: boolean
  onSelect: (day: ISODate) => void
}) {
  const d = parseISODate(day)
  return (
    <span className="flex justify-center py-0.5">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect(day)}
        aria-pressed={isSelected}
        aria-label={`${isToday ? 'Today, ' : ''}${d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}`}
        className={[
          'relative grid size-10 place-items-center rounded-full text-[14px] tabular-nums outline-none transition-colors duration-150',
          'focus-visible:ring-2 focus-visible:ring-primary/30',
          isSelected
            ? `bg-ink font-semibold text-white ${isToday ? 'ring-4 ring-primary-soft' : ''}`
            : isToday
              ? 'bg-primary-soft font-semibold text-ink'
              : disabled
                ? 'cursor-default text-ink-3/60'
                : 'font-medium text-ink hover:bg-surface',
        ].join(' ')}
      >
        {d.getDate()}
      </button>
    </span>
  )
}

function NavButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-8 place-items-center rounded-full text-ink-2 outline-none hover:bg-surface hover:text-ink focus-visible:bg-surface disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  )
}
