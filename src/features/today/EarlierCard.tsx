import { useId, useState, type ReactNode } from 'react'
import { labels } from '../../config/labels.ts'
import { ChevronDownIcon } from '../../components/ui/icons.tsx'
import { MoveList } from '../moves/components/MoveRow.tsx'

/**
 * Unfinished Moves from earlier days, as one calm card instead of a red
 * "overdue" list. One tap brings them all into today; expand to handle them
 * one by one.
 */
export function EarlierCard({
  count,
  onMoveAllToToday,
  children,
}: {
  count: number
  onMoveAllToToday: () => void
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const listId = useId()
  const noun = count === 1 ? labels.move.singular : labels.move.plural

  return (
    <section className="rounded-2xl bg-surface">
      <div className="flex items-center gap-3 p-4">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={listId}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <span className="min-w-0">
            <span className="block text-[15px] font-semibold text-ink">
              {count} {noun} from earlier
            </span>
            <span className="block text-[13px] text-ink-2">Still open from past days</span>
          </span>
          <ChevronDownIcon
            size={16}
            strokeWidth={2.2}
            className={`shrink-0 text-ink-2 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          />
        </button>
        <button
          type="button"
          onClick={onMoveAllToToday}
          className="h-9 shrink-0 rounded-full border border-ink/15 bg-white px-4 text-[14px] font-semibold text-ink outline-none transition-colors duration-150 hover:border-ink/40 focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          Move to today
        </button>
      </div>
      {open && (
        <div id={listId} className="fade-enter px-2 pb-2">
          <MoveList>{children}</MoveList>
        </div>
      )}
    </section>
  )
}
