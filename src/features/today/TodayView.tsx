import { useRef, useState } from 'react'
import { labels } from '../../config/labels.ts'
import { formatLongDate, formatRelativeDay } from '../../lib/dates.ts'
import { PageHeader } from '../../components/layout/PageHeader.tsx'
import { BrandSymbol } from '../../components/ui/BrandSymbol.tsx'
import { ProgressBar } from '../../components/ui/ProgressBar.tsx'
import { useArcs } from '../arcs/useArcs.ts'
import { MoveRow } from '../moves/components/MoveRow.tsx'
import { DoneGroup } from './DoneGroup.tsx'
import { QuickAdd } from './QuickAdd.tsx'
import { useTodayMoves } from './useTodayMoves.ts'

export function TodayView() {
  const { today, overdue, open, done, total, doneCount, progress, addMove, toggleMove } = useTodayMoves()
  const { getArc } = useArcs()
  const inputRef = useRef<HTMLInputElement>(null)
  const [addOpened, setAddOpened] = useState(false)

  const isEmpty = total === 0
  const allDone = !isEmpty && overdue.length === 0 && open.length === 0
  const showQuickAdd = !isEmpty || addOpened

  return (
    <>
      <PageHeader
        title={labels.today.singular}
        eyebrow={
          <>
            <BrandSymbol size={14} className="text-ink-3" />
            <span>{formatLongDate(today)}</span>
          </>
        }
      />

      {!isEmpty && (
        <div className="mb-7">
          <p className="mb-2 text-[13px] text-ink-2">
            <span className="font-semibold text-ink">{doneCount}</span> of {total} done
          </p>
          <ProgressBar value={progress} label={`${doneCount} of ${total} ${labels.move.plural} done`} />
        </div>
      )}

      {overdue.length > 0 && (
        <section className="mb-6">
          <SectionHeading title="Overdue" count={overdue.length} />
          <ul>
            {overdue.map((move) => (
              <MoveRow
                key={move.id}
                move={move}
                arcTitle={getArc(move.arcId)?.title}
                meta={formatRelativeDay(move.date, today)}
                onToggle={toggleMove}
              />
            ))}
          </ul>
        </section>
      )}

      {isEmpty && !addOpened ? (
        <div className="pt-16 text-center">
          <p className="text-[15px] text-ink-2">Nothing planned for today.</p>
          <button
            type="button"
            onClick={() => {
              setAddOpened(true)
              requestAnimationFrame(() => inputRef.current?.focus())
            }}
            className="mt-4 h-11 rounded-full bg-primary px-5 text-[15px] font-semibold text-on-primary outline-none transition-colors duration-150 hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
          >
            Add a {labels.move.singular}
          </button>
        </div>
      ) : (
        <section>
          {overdue.length > 0 && <SectionHeading title={labels.today.singular} count={open.length} />}
          {allDone && <p className="pb-1 text-[15px] text-ink-2">All done for today.</p>}
          <ul>
            {open.map((move) => (
              <MoveRow key={move.id} move={move} arcTitle={getArc(move.arcId)?.title} onToggle={toggleMove} />
            ))}
          </ul>
          {showQuickAdd && (
            <div className={open.length > 0 ? 'border-t border-line' : ''}>
              <QuickAdd onAdd={(title) => addMove(title, today)} inputRef={inputRef} />
            </div>
          )}
        </section>
      )}

      {done.length > 0 && (
        <DoneGroup count={done.length}>
          {done.map((move) => (
            <MoveRow key={move.id} move={move} arcTitle={getArc(move.arcId)?.title} onToggle={toggleMove} />
          ))}
        </DoneGroup>
      )}
    </>
  )
}

function SectionHeading({ title, count }: { title: string; count: number }) {
  return (
    <h2 className="flex items-center gap-1.5 py-1.5 text-[13px] font-semibold text-ink-2">
      {title}
      <span className="font-normal text-ink-3">{count}</span>
    </h2>
  )
}
