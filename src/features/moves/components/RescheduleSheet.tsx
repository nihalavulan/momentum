import { useEffect, type ReactNode } from 'react'
import { labels } from '../../../config/labels.ts'
import { addDays, formatRelativeDay, nextMonday, upcomingWeekend, type ISODate } from '../../../lib/dates.ts'
import { haptic } from '../../../lib/haptics.ts'
import { MonthCalendar } from '../../../components/ui/MonthCalendar.tsx'
import type { Move } from '../types.ts'
import { SpaceChoice } from '../../spaces/components/SpaceChips.tsx'
import type { Space } from '../../spaces/types.ts'

/**
 * Pick a new day for one Move: quick chips (Today, Tomorrow, Weekend, Next
 * week, No date) or any day on the month calendar. One tap applies and closes.
 *
 * Mobile: a sheet rising from the bottom (no keyboard here, so the thumb wins).
 * Desktop: a centred card.
 */
export function RescheduleSheet({
  move,
  today,
  onPick,
  onClose,
  spaces = [],
  onPickSpace,
  spaceLockedBy,
}: {
  move: Move
  today: ISODate
  onPick: (date: ISODate | null) => void
  onClose: () => void
  /** Active Spaces to choose from. The Space section shows when there are any. */
  spaces?: Space[]
  /** Changes the Move's Space; the sheet stays open. */
  onPickSpace?: (spaceId: string | null) => void
  /** Title of the Arc that sets this Move's Space (then it can't be changed here). */
  spaceLockedBy?: string
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [onClose])

  const quick: { key: string; label: string; date: ISODate | null }[] = [
    { key: 'today', label: 'Today', date: today },
    { key: 'tomorrow', label: 'Tomorrow', date: addDays(today, 1) },
    { key: 'weekend', label: 'Weekend', date: upcomingWeekend(today) },
    { key: 'next-week', label: 'Next week', date: nextMonday(today) },
    { key: 'none', label: 'No date', date: null },
  ]
  const selectedKey = quick.find((q) => q.date === move.date)?.key

  const pick = (date: ISODate | null) => {
    haptic('selection')
    if (date === move.date) return onClose()
    onPick(date)
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Reschedule ${labels.move.singular}`}
      className="fixed inset-0 z-40 flex items-end justify-center lg:items-center"
    >
      <button type="button" aria-label="Close" onClick={onClose} className="fade-enter absolute inset-0 bg-black/30" />
      <div className="reschedule-enter relative max-h-[92dvh] w-full max-w-[400px] overflow-y-auto rounded-t-[28px] bg-white px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+20px)] shadow-[0_-8px_40px_rgba(0,0,0,0.16)] lg:rounded-[28px] lg:pb-5 lg:shadow-[0_16px_48px_rgba(0,0,0,0.18)]">
        <span aria-hidden className="mx-auto mb-3 block h-1 w-9 rounded-full bg-line lg:hidden" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[17px] font-semibold text-ink">Reschedule</p>
            <p className="truncate text-[14px] text-ink-2">{move.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 h-9 shrink-0 rounded-full px-3 text-[15px] font-semibold text-ink outline-none hover:bg-surface focus-visible:bg-surface"
          >
            Cancel
          </button>
        </div>
        <p className="mt-1 text-[13px] text-ink-3">
          Now: {move.date ? formatRelativeDay(move.date, today) : 'No date'}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {quick.map((q) => (
            <QuickChip key={q.key} selected={selectedKey === q.key} onClick={() => pick(q.date)}>
              {q.label}
            </QuickChip>
          ))}
        </div>

        <div className="mt-4 flex justify-center border-t border-line pt-4">
          <MonthCalendar selected={move.date} today={today} onSelect={(d) => pick(d)} />
        </div>

        {onPickSpace && (spaces.length > 0 || move.spaceId) && (
          <div className="mt-4 border-t border-line pt-4">
            <p className="mb-2.5 text-[14px] font-semibold text-ink">{labels.space.singular}</p>
            {spaceLockedBy ? (
              <p className="text-[13px] text-ink-2">
                Set by the {labels.arc.singular} “{spaceLockedBy}”.
              </p>
            ) : (
              <SpaceChoice spaces={spaces} selected={move.spaceId ?? null} onSelect={onPickSpace} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function QuickChip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        'flex h-9 shrink-0 items-center rounded-full border px-4 text-[14px] font-medium whitespace-nowrap outline-none transition-colors duration-150',
        'focus-visible:ring-2 focus-visible:ring-primary/30',
        selected ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-ink/40',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
