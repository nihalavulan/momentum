import { useCallback, useState } from 'react'
import { labels } from '../../config/labels.ts'
import { formatDayTitle, todayISO, type ISODate } from '../../lib/dates.ts'
import { Toast } from '../../components/ui/Toast.tsx'
import { useToast } from '../../components/ui/useToast.ts'
import { useArcs } from '../arcs/useArcs.ts'
import { Composer } from '../today/Composer.tsx'
import { DoneGroup } from '../today/DoneGroup.tsx'
import { MoveList, MoveRow } from './components/MoveRow.tsx'
import { useMoves } from './movesContext.ts'
import { RescheduleSheet } from './components/RescheduleSheet.tsx'
import type { Move } from './types.ts'
import { haptic } from '../../lib/haptics.ts'
import { groupUndated } from './moveRules.ts'

/**
 * Moves tab, first version: the Moves that have no date yet.
 * Add straight into it (defaults to no date), tick them off, or bring one
 * into today. More views of all Moves come later.
 */
export function MovesView() {
  const today = todayISO()
  const { moves, addMove, toggleMove, moveToDay } = useMoves()
  const { arcs, getArc } = useArcs()
  const { open, done } = groupUndated(moves)
  const { toast, show, dismiss } = useToast()
  const [rescheduling, setRescheduling] = useState<Move | null>(null)
  const closeReschedule = useCallback(() => setRescheduling(null), [])

  const rescheduleTo = (move: Move, to: ISODate | null) => {
    moveToDay(move.id, to)
    if (to !== null) show(`Moved to ${formatDayTitle(to, today).toLowerCase()}`, () => moveToDay(move.id, move.date))
  }

  const handleToggle = (id: string) => {
    const move = moves.find((m) => m.id === id)
    toggleMove(id)
    if (move && !move.done) show(`Done: ${move.title}`, () => toggleMove(id))
  }

  const handleAdd = (title: string, date: ISODate | null, arcId: string | null) => {
    haptic('light')
    addMove(title, date, { arcId })
    if (date !== null) show(`Added to ${formatDayTitle(date, today)}`)
  }

  return (
    <>
      <header className="pt-5 lg:pt-12">
        <h1 className="text-[34px] leading-[1.08] font-bold tracking-[-0.03em] text-ink lg:text-[44px]">
          {labels.move.plural}
        </h1>
        <p className="mt-2 text-[15px] text-ink-2">
          {open.length === 0
            ? `No ${labels.move.plural} without a date`
            : `${open.length} without a date`}
        </p>
      </header>

      <div className="mt-6 max-w-[720px]">
        <Composer defaultDate={null} today={today} arcs={arcs} onAdd={handleAdd} />

        <section className="mt-8">
          <h2 className="mb-3 text-[17px] font-semibold text-ink">No date</h2>
          {open.length > 0 ? (
            <MoveList label={`${labels.move.plural} with no date`}>
              {open.map((m) => (
                <MoveRow
                  key={m.id}
                  move={m}
                  arcTitle={getArc(m.arcId)?.title}
                  action={{
                    label: 'Today',
                    onClick: () => {
                      moveToDay(m.id, today)
                      show('Moved to today', () => moveToDay(m.id, null))
                    },
                  }}
                  onToggle={handleToggle}
                  onReschedule={setRescheduling}
                />
              ))}
            </MoveList>
          ) : (
            <p className="rounded-2xl border border-dashed border-line px-6 py-8 text-center text-[14px] text-ink-2">
              {labels.move.plural} you add with “No date” wait here until you give them a day.
            </p>
          )}
        </section>

        {done.length > 0 && (
          <DoneGroup count={done.length}>
            {done.map((m) => (
              <MoveRow key={m.id} move={m} arcTitle={getArc(m.arcId)?.title} onToggle={handleToggle} />
            ))}
          </DoneGroup>
        )}
      </div>

      {rescheduling && (
        <RescheduleSheet
          move={rescheduling}
          today={today}
          onPick={(to) => rescheduleTo(rescheduling, to)}
          onClose={closeReschedule}
        />
      )}
      <Toast toast={toast} onDismiss={dismiss} />
    </>
  )
}
