import { useCallback, useEffect, useRef, useState } from 'react'
import { labels } from '../../config/labels.ts'
import { addDays, formatDayTitle, formatLongDate, formatRelativeDay, todayISO, type ISODate } from '../../lib/dates.ts'
import { AccountMenu } from '../auth/AccountMenu.tsx'
import { PlusIcon } from '../../components/ui/icons.tsx'
import { Toast } from '../../components/ui/Toast.tsx'
import { useToast } from '../../components/ui/useToast.ts'
import { useHideOnScroll } from '../../components/layout/useHideOnScroll.ts'
import { ArcsInProgress } from '../arcs/components/ArcsInProgress.tsx'
import { useArcs } from '../arcs/useArcs.ts'
import { MoveList, MoveRow } from '../moves/components/MoveRow.tsx'
import { RescheduleSheet } from '../moves/components/RescheduleSheet.tsx'
import { haptic } from '../../lib/haptics.ts'
import { useMoves } from '../moves/movesContext.ts'
import { dayProgress, groupForDay } from '../moves/moveRules.ts'
import type { Move } from '../moves/types.ts'
import { Composer } from './Composer.tsx'
import { ComposerSheet } from './ComposerSheet.tsx'
import { DoneGroup } from './DoneGroup.tsx'
import { EarlierCard } from './EarlierCard.tsx'
import { UpNext } from './UpNext.tsx'
import { WeekStrip } from './WeekStrip.tsx'

/**
 * The day view. Opens on today; the week strip switches to any other day.
 * Mobile: one column, add via the floating button + top sheet.
 * Desktop: inline composer (press N), and a side rail with Arcs and tomorrow.
 */
export function TodayView() {
  const today = todayISO()
  const tomorrow = addDays(today, 1)
  const [day, setDay] = useState<ISODate>(today)
  const isToday = day === today

  const { moves, addMove, toggleMove, moveToDay } = useMoves()
  const { arcs, getArc } = useArcs()
  const { overdue, open, done, total } = groupForDay(moves, day, today)
  const progressFor = (d: ISODate) => dayProgress(moves, d, today)

  const { toast, show, dismiss } = useToast()
  const [sheetOpen, setSheetOpen] = useState(false)
  const closeSheet = useCallback(() => setSheetOpen(false), [setSheetOpen])
  const [rescheduling, setRescheduling] = useState<Move | null>(null)
  const closeReschedule = useCallback(() => setRescheduling(null), [])
  const composerInput = useRef<HTMLInputElement>(null)
  const barHidden = useHideOnScroll()

  // Desktop: press N to start a new Move.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'n' || e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))) return
      if (!window.matchMedia('(min-width: 1024px)').matches) return
      e.preventDefault()
      composerInput.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const startAdding = () => {
    if (window.matchMedia('(min-width: 1024px)').matches) composerInput.current?.focus()
    else setSheetOpen(true)
  }

  const handleToggle = (id: string) => {
    const move = moves.find((m) => m.id === id)
    toggleMove(id)
    if (move && !move.done) show(`Done: ${move.title}`, () => toggleMove(id))
  }

  const reschedule = (move: Move, to: ISODate) => {
    moveToDay(move.id, to)
    show(`Moved to ${formatDayTitle(to, today).toLowerCase()}`, () => moveToDay(move.id, move.date))
  }

  const rescheduleTo = (move: Move, to: ISODate | null) => {
    if (to === null) {
      moveToDay(move.id, null)
      show(`Moved to no date. Find it in ${labels.move.plural}.`, () => moveToDay(move.id, move.date))
    } else reschedule(move, to)
  }

  const selectDay = (d: ISODate) => {
    if (d !== day) haptic('selection')
    setDay(d)
  }

  const moveAllEarlier = () => {
    haptic('light')
    const previous = overdue.map((m) => [m.id, m.date] as const)
    previous.forEach(([id]) => moveToDay(id, today))
    show(`${previous.length} moved to today`, () => previous.forEach(([id, date]) => moveToDay(id, date)))
  }

  const handleAdd = (title: string, date: ISODate | null, arcId: string | null) => {
    haptic('light')
    addMove(title, date, { arcId })
    // Say where it went when it won't appear in the list you're looking at.
    if (date === null) show(`Added with no date. Find it in ${labels.move.plural}.`)
    else if (date !== day) show(`Added to ${formatDayTitle(date, today)}`)
  }

  const composerProps = { defaultDate: day, today, arcs, onAdd: handleAdd }
  const nextDay = isToday ? tomorrow : addDays(day, 1)
  const nextLabel = isToday ? 'Tomorrow' : 'Next day'
  const nothingLeft = overdue.length === 0 && open.length === 0

  return (
    <>
      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_288px] xl:gap-16">
        <div className="min-w-0">
          <header className="pt-5 lg:pt-12">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[15px] font-medium text-ink-2">{formatLongDate(day)}</p>
                <h1 className="mt-0.5 text-[34px] leading-[1.08] font-bold tracking-[-0.03em] text-ink lg:text-[44px]">
                  {formatDayTitle(day, today)}
                </h1>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {!isToday && (
                  <button
                    type="button"
                    onClick={() => selectDay(today)}
                    className="h-9 shrink-0 rounded-full border border-ink/15 px-4 text-[14px] font-semibold text-ink outline-none hover:border-ink/40 focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    Back to today
                  </button>
                )}
                {/* Mobile: account lives here; desktop has it in the sidebar. */}
                <div className="lg:hidden">
                  <AccountMenu />
                </div>
              </div>
            </div>
            <p className="mt-2 text-[15px] text-ink-2">
              {total === 0 ? (
                'Nothing planned'
              ) : done.length === total ? (
                `All ${total} done`
              ) : (
                <>
                  <span className="font-semibold text-ink tabular-nums">{done.length}</span> of {total} done
                </>
              )}
            </p>
          </header>

          <div className="mt-6 lg:mt-8">
            <WeekStrip selected={day} today={today} progressFor={progressFor} onSelect={selectDay} />
          </div>

          <div className="mt-6 hidden lg:block">
            <Composer key={day} {...composerProps} inputRef={composerInput} />
          </div>

          {overdue.length > 0 && (
            <div className="mt-6">
              <EarlierCard count={overdue.length} onMoveAllToToday={moveAllEarlier}>
                {overdue.map((m) => (
                  <MoveRow
                    key={m.id}
                    move={m}
                    arcTitle={getArc(m.arcId)?.title}
                    meta={m.date ? formatRelativeDay(m.date, today) : undefined}
                    action={{ label: 'Today', onClick: () => reschedule(m, today) }}
                    onToggle={handleToggle}
                    onReschedule={setRescheduling}
                  />
                ))}
              </EarlierCard>
            </div>
          )}

          <div className="mt-6">
            {open.length > 0 ? (
              <MoveList label={`${labels.move.plural} for ${formatDayTitle(day, today)}`}>
                {open.map((m) => (
                  <MoveRow
                    key={m.id}
                    move={m}
                    arcTitle={getArc(m.arcId)?.title}
                    action={{ label: nextLabel, onClick: () => reschedule(m, nextDay) }}
                    onToggle={handleToggle}
                    onReschedule={setRescheduling}
                  />
                ))}
              </MoveList>
            ) : nothingLeft && total === 0 ? (
              <div className="rounded-2xl border border-dashed border-line px-6 py-10 text-center">
                <p className="text-[16px] font-semibold text-ink">
                  {isToday ? 'Nothing planned for today' : `Nothing planned for ${formatDayTitle(day, today).toLowerCase()}`}
                </p>
                <p className="mt-1 text-[14px] text-ink-2">Add the first {labels.move.singular} to get going.</p>
                <button
                  type="button"
                  onClick={startAdding}
                  className="mt-5 h-11 rounded-full bg-primary px-5 text-[15px] font-semibold text-on-primary outline-none transition-colors duration-150 hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
                >
                  Add a {labels.move.singular}
                </button>
              </div>
            ) : nothingLeft ? (
              <div className="rounded-2xl bg-primary-soft px-5 py-4">
                <p className="text-[15px] font-semibold text-ink">All done{isToday ? ' for today' : ''}.</p>
                <p className="text-[14px] text-ink-2">Nice momentum. Plan tomorrow or take the win.</p>
              </div>
            ) : null}
          </div>

          {done.length > 0 && (
            <DoneGroup count={done.length}>
              {done.map((m) => (
                <MoveRow key={m.id} move={m} arcTitle={getArc(m.arcId)?.title} onToggle={handleToggle} />
              ))}
            </DoneGroup>
          )}

          <div className="mt-10 xl:hidden">
            <ArcsInProgress arcs={arcs} moves={moves} today={today} layout="scroll" />
          </div>
        </div>

        <aside className="hidden space-y-10 pt-12 xl:block">
          <ArcsInProgress arcs={arcs} moves={moves} today={today} layout="stack" />
          {isToday && (
            <UpNext day={tomorrow} today={today} moves={moves} getArc={getArc} onOpen={() => selectDay(tomorrow)} />
          )}
        </aside>
      </div>

      {/* Mobile: the one main action, moving with the bottom bar. */}
      <button
        type="button"
        onClick={() => {
          haptic('light')
          setSheetOpen(true)
        }}
        aria-label={`Add a ${labels.move.singular}`}
        className={[
          'fixed right-5 z-30 grid size-14 place-items-center rounded-full bg-primary text-on-primary outline-none lg:hidden',
          'shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_35%,transparent)] transition-[bottom,transform] duration-200 ease-out active:scale-95',
          'focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
          barHidden ? 'bottom-[calc(env(safe-area-inset-bottom)+20px)]' : 'bottom-[calc(env(safe-area-inset-bottom)+80px)]',
        ].join(' ')}
      >
        <PlusIcon size={26} strokeWidth={2.2} />
      </button>

      {sheetOpen && <ComposerSheet {...composerProps} onClose={closeSheet} />}
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
