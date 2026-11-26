import { useState, type Ref } from 'react'
import { labels } from '../../config/labels.ts'
import { addDays, formatDayTitle, type ISODate } from '../../lib/dates.ts'
import { PlusIcon } from '../../components/ui/icons.tsx'
import type { Arc } from '../arcs/types.ts'
import { MOVE_TITLE_MAX, normalizeMoveTitle } from '../moves/moveRules.ts'

/**
 * Add a Move: title, which day, and (optionally) which Arc.
 * Enter adds it and keeps focus for the next one; day and Arc stay selected.
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
  defaultDate: ISODate
  today: ISODate
  arcs: Arc[]
  onAdd: (title: string, date: ISODate, arcId: string | null) => void
  inputRef?: Ref<HTMLInputElement>
  autoFocus?: boolean
  alwaysShowOptions?: boolean
}) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(defaultDate)
  const [arcId, setArcId] = useState<string | null>(null)
  const [active, setActive] = useState(false)

  const hasText = title.trim().length > 0
  const showOptions = alwaysShowOptions || active || hasText
  const dayOptions = [...new Set([today, addDays(today, 1), defaultDate])]

  return (
    <form
      onFocus={() => setActive(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setActive(false)
      }}
      onSubmit={(e) => {
        e.preventDefault()
        const clean = normalizeMoveTitle(title)
        if (!clean) return
        onAdd(clean, date, arcId)
        setTitle('')
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
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setTitle('')
              e.currentTarget.blur()
            }
          }}
          autoFocus={autoFocus}
          maxLength={MOVE_TITLE_MAX}
          enterKeyHint="enter"
          autoComplete="off"
          aria-label={`Add a ${labels.move.singular}`}
          placeholder={`Add a ${labels.move.singular}`}
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

      {showOptions && (
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto border-t border-line px-4 py-3">
          {dayOptions.map((d) => (
            <Chip key={d} selected={d === date} onClick={() => setDate(d)}>
              {formatDayTitle(d, today)}
            </Chip>
          ))}
          {arcs.length > 0 && <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-line" />}
          {arcs.map((arc) => (
            <Chip key={arc.id} selected={arc.id === arcId} onClick={() => setArcId((cur) => (cur === arc.id ? null : arc.id))}>
              {arc.title}
            </Chip>
          ))}
        </div>
      )}
    </form>
  )
}

/** Airbnb-style filter chip: outlined, solid ink when selected. */
function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        'h-8 shrink-0 rounded-full border px-3.5 text-[13px] font-medium whitespace-nowrap outline-none transition-colors duration-150',
        'focus-visible:ring-2 focus-visible:ring-primary/30',
        selected ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-ink/40',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
