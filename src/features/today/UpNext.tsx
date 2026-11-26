import { formatDayTitle, type ISODate } from '../../lib/dates.ts'
import type { Arc } from '../arcs/types.ts'
import type { Move } from '../moves/types.ts'

/** Desktop side rail: a quiet look at the next day, with a jump to plan it. */
export function UpNext({
  day,
  today,
  moves,
  getArc,
  onOpen,
}: {
  day: ISODate
  today: ISODate
  moves: Move[]
  getArc: (id: string | null | undefined) => Arc | undefined
  onOpen: () => void
}) {
  const items = moves.filter((m) => m.date === day && !m.done)
  const title = formatDayTitle(day, today)

  return (
    <section aria-label={title}>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-[17px] font-semibold text-ink">{title}</h2>
        <button
          type="button"
          onClick={onOpen}
          className="rounded-md text-[14px] font-semibold text-ink underline decoration-ink/25 underline-offset-4 outline-none hover:decoration-ink focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          Open
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-[14px] text-ink-2">Nothing planned yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((m) => {
            const arc = getArc(m.arcId)
            return (
              <li key={m.id} className="flex gap-3">
                <span aria-hidden className="mt-[3px] size-4 shrink-0 rounded-full border-[1.6px] border-ink-3" />
                <span className="min-w-0">
                  <span className="block text-[14px] leading-snug text-ink">{m.title}</span>
                  {arc && <span className="block truncate text-[12px] text-ink-2">{arc.title}</span>}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
