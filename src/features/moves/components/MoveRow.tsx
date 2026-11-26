import { useEffect, useRef, useState } from 'react'
import { CheckCircle } from '../../../components/ui/CheckCircle.tsx'
import type { Move } from '../types.ts'

/** How long the check animation plays before the Move moves to Done. */
const COMPLETE_DELAY_MS = 420

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * One Move: completion circle, title, optional Arc pill, optional meta on the right.
 * Completing is optimistic: the circle fills at once, then the row hands off to
 * Done after a short beat so the check animation can be seen.
 */
export function MoveRow({
  move,
  arcTitle,
  meta,
  onToggle,
}: {
  move: Move
  arcTitle?: string
  meta?: string
  onToggle: (id: string) => void
}) {
  const [completing, setCompleting] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  // Rows that just appeared (new Move, or just completed) ease in; the initial list doesn't.
  const [fresh] = useState(() => {
    const changedAt = move.done ? move.doneAt : move.createdAt
    return changedAt ? Date.now() - Date.parse(changedAt) < 1500 : false
  })

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const checked = move.done || completing

  const handleToggle = () => {
    if (move.done) return onToggle(move.id)
    if (completing) return
    setCompleting(true)
    timer.current = window.setTimeout(
      () => onToggle(move.id),
      prefersReducedMotion() ? 0 : COMPLETE_DELAY_MS,
    )
  }

  return (
    <li className={`group flex items-start gap-3.5 ${fresh ? 'row-enter' : ''}`}>
      <div className="py-[13px]">
        <CheckCircle
          checked={checked}
          animate={completing}
          onToggle={handleToggle}
          label={move.done ? `Mark "${move.title}" as not done` : `Complete "${move.title}"`}
        />
      </div>

      <div className="flex min-w-0 flex-1 items-start gap-3 border-b border-line py-3 group-last:border-b-0">
        <div className="min-w-0 flex-1">
          <p
            className={[
              'text-[16px] leading-[24px] break-words transition-colors duration-200',
              checked ? 'text-ink-3' : 'text-ink',
              move.done ? 'line-through decoration-ink-3/70' : '',
            ].join(' ')}
          >
            {move.title}
          </p>
          {arcTitle && (
            <span
              className={[
                'mt-1 inline-flex max-w-full items-center rounded-full px-2 py-[2px] text-[12px] leading-[16px]',
                checked ? 'bg-surface text-ink-3' : 'bg-surface text-ink-2',
              ].join(' ')}
            >
              <span className="truncate">{arcTitle}</span>
            </span>
          )}
        </div>
        {meta && <span className="shrink-0 pt-[3px] text-[13px] text-ink-3">{meta}</span>}
      </div>
    </li>
  )
}
