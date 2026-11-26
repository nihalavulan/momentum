import { labels } from '../../../config/labels.ts'
import { formatDateRange, type ISODate } from '../../../lib/dates.ts'
import type { Move } from '../../moves/types.ts'
import { arcDaysLeft, arcProgress, isArcActive } from '../arcRules.ts'
import type { Arc } from '../types.ts'

/**
 * Active Arcs with their progress. `scroll`: swipeable row on mobile, a
 * two-column grid on wider screens. `stack`: one column (desktop side rail).
 */
export function ArcsInProgress({
  arcs,
  moves,
  today,
  layout,
}: {
  arcs: Arc[]
  moves: Move[]
  today: ISODate
  layout: 'scroll' | 'stack'
}) {
  const active = arcs.filter((a) => isArcActive(a, today))
  if (active.length === 0) return null

  return (
    <section aria-label={`${labels.arc.plural} in progress`}>
      <h2 className="mb-3 text-[17px] font-semibold text-ink">{labels.arc.plural} in progress</h2>
      <div
        className={
          layout === 'stack'
            ? 'space-y-3'
            : 'no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0'
        }
      >
        {active.map((arc) => (
          <ArcCard
            key={arc.id}
            arc={arc}
            moves={moves}
            today={today}
            className={layout === 'scroll' ? 'w-[82%] shrink-0 snap-start sm:w-auto' : ''}
          />
        ))}
      </div>
    </section>
  )
}

function ArcCard({ arc, moves, today, className }: { arc: Arc; moves: Move[]; today: ISODate; className: string }) {
  const { done, total, ratio } = arcProgress(moves, arc.id)
  const left = arcDaysLeft(arc, today)
  const leftLabel = left <= 0 ? 'Ends today' : left === 1 ? '1 day left' : `${left} days left`

  return (
    <article className={`rounded-2xl border border-line bg-white p-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[15px] leading-snug font-semibold text-ink">{arc.title}</h3>
        <span className="shrink-0 pt-px text-[13px] text-ink-2">{leftLabel}</span>
      </div>
      <p className="mt-0.5 text-[13px] text-ink-2">{formatDateRange(arc.startDate, arc.endDate)}</p>
      <div
        role="progressbar"
        aria-label={`${arc.title} progress`}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        className="mt-5 h-1.5 overflow-hidden rounded-full bg-surface"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${Math.round(ratio * 100)}%` }}
        />
      </div>
      <p className="mt-2 text-[13px] text-ink-2">
        <span className="font-semibold text-ink tabular-nums">{done}</span> of {total} {labels.move.plural} done
      </p>
    </article>
  )
}
