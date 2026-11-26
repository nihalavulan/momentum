import { useEffect, useRef, useState, type ReactNode } from 'react'
import { CheckCircle } from '../../../components/ui/CheckCircle.tsx'
import { ArrowRightIcon } from '../../../components/ui/icons.tsx'
import type { Move } from '../types.ts'

/** How long the check animation plays before the Move leaves the list. */
const COMPLETE_DELAY_MS = 420

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export interface RowAction {
  label: string
  onClick: () => void
}

/**
 * One Move inside a grouped card: completion circle, title, then a quiet line
 * with the Arc and any extra detail. On desktop, hovering shows one action
 * (e.g. push to tomorrow).
 *
 * Completing is optimistic: the circle fills at once, then the row hands off
 * after a short beat so the check animation can be seen.
 */
export function MoveRow({
  move,
  arcTitle,
  meta,
  action,
  onToggle,
}: {
  move: Move
  arcTitle?: string
  meta?: string
  action?: RowAction
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
    timer.current = window.setTimeout(() => onToggle(move.id), prefersReducedMotion() ? 0 : COMPLETE_DELAY_MS)
  }

  const details = [arcTitle, meta].filter(Boolean)

  return (
    <li className={`group/row flex items-start gap-3.5 px-4 ${fresh ? 'row-enter' : ''}`}>
      <div className="pt-[15px]">
        <CheckCircle
          checked={checked}
          animate={completing}
          onToggle={handleToggle}
          label={move.done ? `Mark "${move.title}" as not done` : `Complete "${move.title}"`}
        />
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-3 border-t border-line py-3.5 group-first/row:border-t-0">
        <div className="min-w-0 flex-1">
          <p
            className={[
              'text-[16px] leading-[22px] break-words transition-colors duration-200',
              checked ? 'text-ink-3' : 'text-ink',
              move.done ? 'line-through decoration-ink-3/70' : '',
            ].join(' ')}
          >
            {move.title}
          </p>
          {details.length > 0 && (
            <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[13px] leading-[18px] text-ink-2">
              {arcTitle && (
                <>
                  <span aria-hidden className={`size-1.5 shrink-0 rounded-full ${checked ? 'bg-ink-3' : 'bg-primary'}`} />
                  <span className="truncate">{arcTitle}</span>
                </>
              )}
              {arcTitle && meta && <span aria-hidden className="text-ink-3">/</span>}
              {meta && <span className="shrink-0">{meta}</span>}
            </p>
          )}
        </div>

        {action && !checked && (
          <button
            type="button"
            onClick={action.onClick}
            aria-label={`${action.label}: ${move.title}`}
            className="hidden h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-ink-2 opacity-0 outline-none transition-opacity duration-150 group-hover/row:opacity-100 hover:bg-surface hover:text-ink focus-visible:opacity-100 focus-visible:bg-surface lg:flex"
          >
            {action.label}
            <ArrowRightIcon size={14} strokeWidth={2} />
          </button>
        )}
      </div>
    </li>
  )
}

/** The grouped card that holds MoveRows. */
export function MoveList({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <ul aria-label={label} className="overflow-hidden rounded-2xl border border-line bg-white">
      {children}
    </ul>
  )
}
