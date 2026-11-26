import { useState } from 'react'
import { labels } from '../../../config/labels.ts'
import { formatDateRange } from '../../../lib/dates.ts'
import type { Arc } from '../types.ts'

/** Searchable list of Arcs, shown once there are more than this many. */
const SEARCH_FROM = 6

/**
 * Pick the Arc a Move belongs to (or none). Scales to many Arcs: a search box
 * appears when the list gets long, and Enter picks the first match.
 */
export function ArcPicker({
  arcs,
  selectedId,
  onSelect,
}: {
  arcs: Arc[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const matches = q ? arcs.filter((a) => a.title.toLowerCase().includes(q)) : arcs

  return (
    <div className="w-full">
      {arcs.length > SEARCH_FROM && (
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            // Don't submit the Move form; pick the first match instead.
            if (e.key === 'Enter') {
              e.preventDefault()
              if (matches[0]) onSelect(matches[0].id)
            }
          }}
          placeholder={`Search ${labels.arc.plural}`}
          aria-label={`Search ${labels.arc.plural}`}
          className="mb-2 h-10 w-full rounded-xl bg-surface px-3 text-[15px] text-ink outline-none placeholder:text-ink-3 focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      )}
      <ul className="space-y-0.5">
        {!q && (
          <Option selected={selectedId === null} onClick={() => onSelect(null)} title={`No ${labels.arc.singular}`} />
        )}
        {matches.map((arc) => (
          <Option
            key={arc.id}
            selected={arc.id === selectedId}
            onClick={() => onSelect(arc.id)}
            title={arc.title}
            detail={formatDateRange(arc.startDate, arc.endDate)}
          />
        ))}
        {q && matches.length === 0 && <li className="px-3 py-2 text-[14px] text-ink-2">No {labels.arc.plural} match.</li>}
      </ul>
    </div>
  )
}

function Option({
  selected,
  onClick,
  title,
  detail,
}: {
  selected: boolean
  onClick: () => void
  title: string
  detail?: string
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left outline-none hover:bg-surface focus-visible:bg-surface"
      >
        <span
          aria-hidden
          className={`size-2 shrink-0 rounded-full ${selected ? 'bg-primary' : detail ? 'bg-ink-3/50' : 'bg-transparent ring-1 ring-ink-3 ring-inset'}`}
        />
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-[15px] ${selected ? 'font-semibold text-ink' : 'text-ink'}`}>{title}</span>
          {detail && <span className="block text-[12px] text-ink-2">{detail}</span>}
        </span>
        {selected && (
          <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-ink" aria-hidden>
            <path d="M3.5 8.5 L6.5 11.5 L12.5 4.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </li>
  )
}
