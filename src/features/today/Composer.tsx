import { useRef, useState, type ReactNode, type RefObject } from 'react'
import { labels } from '../../config/labels.ts'
import {
  addDays,
  formatLongDate,
  formatRelativeDay,
  nextMonday,
  upcomingWeekend,
  type ISODate,
} from '../../lib/dates.ts'
import { ArcsIcon, CalendarIcon, ChevronDownIcon, PlusIcon } from '../../components/ui/icons.tsx'
import { MonthCalendar } from '../../components/ui/MonthCalendar.tsx'
import { ArcPicker } from '../arcs/components/ArcPicker.tsx'
import { isArcActive } from '../arcs/arcRules.ts'
import type { Arc } from '../arcs/types.ts'
import { MOVE_TITLE_MAX, normalizeMoveTitle } from '../moves/moveRules.ts'
import { parseMoveDate } from '../moves/parseMoveDate.ts'

type Panel = 'calendar' | 'arc' | null

/**
 * Add a Move: title, which day (or no date), and which Arc.
 *
 * - Quick day chips, plus "Pick date" for any day on a month calendar.
 * - Typing a date ("… fri", "… 12 dec", "… tomorrow") sets it live; the phrase
 *   is removed from the title on save. "Ignore" keeps it as plain text.
 * - Enter adds and keeps focus for the next one; the chosen day and Arc stay.
 *
 * Used inline on desktop and inside the mobile sheet.
 */
export function Composer({
  defaultDate,
  today,
  arcs,
  onAdd,
  inputRef,
  autoFocus = false,
  alwaysShowOptions = false,
}: {
  defaultDate: ISODate | null
  today: ISODate
  arcs: Arc[]
  onAdd: (title: string, date: ISODate | null, arcId: string | null) => void
  inputRef?: RefObject<HTMLInputElement | null>
  autoFocus?: boolean
  alwaysShowOptions?: boolean
}) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState<ISODate | null>(defaultDate)
  const [arcId, setArcId] = useState<string | null>(null)
  const [active, setActive] = useState(false)
  const [panel, setPanel] = useState<Panel>(null)
  const [ignoredPhrase, setIgnoredPhrase] = useState<string | null>(null)
  const localInput = useRef<HTMLInputElement | null>(null)

  const parsed = parseMoveDate(title, today)
  const useParsed = parsed !== null && parsed.phrase.toLowerCase() !== ignoredPhrase
  const effectiveDate = useParsed ? parsed.date : date

  const hasText = title.trim().length > 0
  const showOptions = alwaysShowOptions || active || hasText || panel !== null

  const quick: { key: string; label: string; date: ISODate | null }[] = [
    { key: 'today', label: formatRelativeDay(today, today), date: today },
    { key: 'tomorrow', label: 'Tomorrow', date: addDays(today, 1) },
    { key: 'weekend', label: 'Weekend', date: upcomingWeekend(today) },
    { key: 'next-week', label: 'Next week', date: nextMonday(today) },
  ]
  // Highlight only the first chip that matches (Weekend can equal Tomorrow on a Friday).
  const selectedKey = effectiveDate === null ? 'none' : (quick.find((q) => q.date === effectiveDate)?.key ?? 'custom')

  const activeArcs = arcs.filter((a) => isArcActive(a, today) || a.id === arcId)
  const selectedArc = arcs.find((a) => a.id === arcId)

  const focusTitle = () => localInput.current?.focus()

  const chooseDate = (d: ISODate | null) => {
    setDate(d)
    // A manual choice wins over a date typed in the title.
    if (parsed) setIgnoredPhrase(parsed.phrase.toLowerCase())
    setPanel(null)
  }

  const togglePanel = (p: Exclude<Panel, null>) => setPanel((cur) => (cur === p ? null : p))

  return (
    <form
      onFocus={() => setActive(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setActive(false)
      }}
      onSubmit={(e) => {
        e.preventDefault()
        const clean = normalizeMoveTitle(useParsed ? parsed.title : title)
        if (!clean) return
        onAdd(clean, effectiveDate, arcId)
        setTitle('')
        setIgnoredPhrase(null)
        setPanel(null)
      }}
      className="rounded-2xl border border-line bg-white transition-[border-color,box-shadow] duration-150 focus-within:border-ink/20 focus-within:shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-center gap-3 pr-2 pl-4">
        <span
          aria-hidden
          className={[
            'grid size-6 shrink-0 place-items-center rounded-full transition-colors duration-150',
            hasText ? 'bg-primary text-on-primary' : 'border-[1.6px] border-dashed border-ink-3 text-ink-3',
          ].join(' ')}
        >
          <PlusIcon size={14} strokeWidth={2.4} />
        </span>
        <input
          ref={(el) => {
            localInput.current = el
            if (inputRef) inputRef.current = el
          }}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (!e.target.value) setIgnoredPhrase(null)
          }}
          onKeyDown={(e) => {
            if (e.key !== 'Escape') return
            if (panel) return setPanel(null)
            setTitle('')
            setIgnoredPhrase(null)
            e.currentTarget.blur()
          }}
          autoFocus={autoFocus}
          maxLength={MOVE_TITLE_MAX}
          enterKeyHint="enter"
          autoComplete="off"
          aria-label={`Add a ${labels.move.singular}`}
          placeholder={`Add a ${labels.move.singular}, e.g. "Call supplier fri"`}
          className="h-14 min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-ink-3"
        />
        {hasText ? (
          <button
            type="submit"
            className="h-10 shrink-0 rounded-full bg-primary px-5 text-[15px] font-semibold text-on-primary outline-none transition-colors duration-150 hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
          >
            Add
          </button>
        ) : (
          !active && (
            <kbd
              aria-hidden
              className="mr-2 hidden h-6 min-w-6 place-items-center rounded-md border border-line px-1.5 font-sans text-[12px] font-semibold text-ink-3 lg:grid"
            >
              N
            </kbd>
          )
        )}
      </div>

      {useParsed && (
        <div className="fade-enter -mt-1 flex items-center gap-2 pr-4 pb-3 pl-[52px] text-[13px]" aria-live="polite">
          <CalendarIcon size={15} strokeWidth={2} className="shrink-0 text-primary" />
          <span className="min-w-0 truncate text-ink-2">
            <span className="font-semibold text-ink">{formatLongDate(parsed.date)}</span> from “{parsed.phrase}”
          </span>
          <button
            type="button"
            onClick={() => {
              setIgnoredPhrase(parsed.phrase.toLowerCase())
              focusTitle()
            }}
            className="shrink-0 rounded-md font-semibold text-ink underline decoration-ink/25 underline-offset-4 outline-none hover:decoration-ink focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            Ignore
          </button>
        </div>
      )}

      {showOptions && (
        <div className="border-t border-line">
          <div className="flex flex-wrap items-center gap-2 px-4 py-3">
            {quick.map((q) => (
              <Chip key={q.key} selected={selectedKey === q.key} onClick={() => chooseDate(q.date)}>
                {q.label}
              </Chip>
            ))}
            <Chip
              selected={selectedKey === 'custom'}
              open={panel === 'calendar'}
              onClick={() => togglePanel('calendar')}
              aria-expanded={panel === 'calendar'}
            >
              <CalendarIcon size={15} strokeWidth={2} />
              {selectedKey === 'custom' && effectiveDate ? formatRelativeDay(effectiveDate, today) : 'Pick date'}
            </Chip>
            <Chip selected={selectedKey === 'none'} onClick={() => chooseDate(null)}>
              No date
            </Chip>

            {activeArcs.length > 0 && (
              <>
                <span aria-hidden className="mx-1 hidden h-5 w-px shrink-0 bg-line sm:block" />
                <Chip
                  selected={arcId !== null}
                  open={panel === 'arc'}
                  onClick={() => togglePanel('arc')}
                  aria-expanded={panel === 'arc'}
                >
                  <ArcsIcon size={15} strokeWidth={2} />
                  <span className="max-w-[11rem] truncate">{selectedArc?.title ?? labels.arc.singular}</span>
                  <ChevronDownIcon
                    size={13}
                    strokeWidth={2.4}
                    className={`transition-transform duration-150 ${panel === 'arc' ? 'rotate-180' : ''}`}
                  />
                </Chip>
              </>
            )}
          </div>

          {panel === 'calendar' && (
            <div className="fade-enter flex justify-center border-t border-line px-4 py-3 lg:justify-start">
              <MonthCalendar
                selected={effectiveDate}
                today={today}
                onSelect={(d) => {
                  chooseDate(d)
                  focusTitle()
                }}
              />
            </div>
          )}

          {panel === 'arc' && (
            <div className="fade-enter border-t border-line px-2 py-2">
              <ArcPicker
                arcs={activeArcs}
                selectedId={arcId}
                onSelect={(id) => {
                  setArcId(id)
                  setPanel(null)
                  focusTitle()
                }}
              />
            </div>
          )}
        </div>
      )}
    </form>
  )
}

/** Airbnb-style filter chip: outlined, solid ink when selected, darker outline while its panel is open. */
function Chip({
  selected,
  open = false,
  onClick,
  children,
  ...rest
}: {
  selected: boolean
  open?: boolean
  onClick: () => void
  children: ReactNode
  'aria-expanded'?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      {...rest}
      className={[
        'flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium whitespace-nowrap outline-none transition-colors duration-150',
        'focus-visible:ring-2 focus-visible:ring-primary/30',
        selected
          ? 'border-ink bg-ink text-white'
          : open
            ? 'border-ink bg-white text-ink'
            : 'border-line bg-white text-ink hover:border-ink/40',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
