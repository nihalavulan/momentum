import { useState, type ReactNode } from 'react'
import { labels } from '../../../config/labels.ts'
import { haptic } from '../../../lib/haptics.ts'
import { readJSON, writeJSON } from '../../../lib/storage.ts'
import { CloseIcon } from '../../../components/ui/icons.tsx'
import { openSpacesManager } from '../spacesContext.ts'
import type { Space } from '../types.ts'
import { SpaceDot } from './SpaceDot.tsx'

/** Outlined chip, solid ink when selected (same language as the add box chips). */
export function SpaceChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={() => {
        haptic('selection')
        onClick()
      }}
      aria-pressed={selected}
      className={[
        'flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium whitespace-nowrap outline-none transition-colors duration-150',
        'focus-visible:ring-2 focus-visible:ring-primary/30',
        selected ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-ink/40',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

/** Today's filter: "All" plus each Space, in one horizontal scrolling row. */
export function SpaceFilter({
  spaces,
  selected,
  onSelect,
}: {
  spaces: Space[]
  selected: string | null
  onSelect: (id: string | null) => void
}) {
  return (
    <div
      role="group"
      aria-label={`Filter by ${labels.space.singular}`}
      className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:px-0"
    >
      <SpaceChip selected={selected === null} onClick={() => onSelect(null)}>
        All
      </SpaceChip>
      {spaces.map((s) => (
        <SpaceChip key={s.id} selected={selected === s.id} onClick={() => onSelect(s.id)}>
          <SpaceDot color={s.color} />
          {s.name}
        </SpaceChip>
      ))}
    </div>
  )
}

/** Pick a Space (or none) for one Move, as a wrapping row of chips. */
export function SpaceChoice({
  spaces,
  selected,
  onSelect,
}: {
  spaces: Space[]
  selected: string | null
  onSelect: (id: string | null) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <SpaceChip selected={selected === null} onClick={() => onSelect(null)}>
        No {labels.space.singular}
      </SpaceChip>
      {spaces.map((s) => (
        <SpaceChip key={s.id} selected={selected === s.id} onClick={() => onSelect(s.id)}>
          <SpaceDot color={s.color} />
          {s.name}
        </SpaceChip>
      ))}
    </div>
  )
}

/**
 * Shown while someone has no Spaces: one quiet line inviting them to create
 * the first. Never blocks anything; can be dismissed on this device.
 */
export function FirstSpacePrompt({ userKey }: { userKey: string }) {
  const key = `momentum:space-prompt-hidden:${userKey}`
  const [hidden, setHidden] = useState(() => readJSON<boolean>(key, false))
  if (hidden) return null

  return (
    <div className="flex items-center gap-2 text-[14px] text-ink-2">
      <p className="min-w-0 flex-1">
        Group {labels.move.plural} by life area.{' '}
        <button
          type="button"
          onClick={() => {
            haptic('light')
            openSpacesManager()
          }}
          className="rounded-md font-semibold text-ink underline decoration-ink/25 underline-offset-4 outline-none hover:decoration-ink focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          Create your first {labels.space.singular}
        </button>
      </p>
      <button
        type="button"
        aria-label="Hide"
        onClick={() => {
          writeJSON(key, true)
          setHidden(true)
        }}
        className="grid size-8 shrink-0 place-items-center rounded-full text-ink-3 outline-none hover:bg-surface hover:text-ink-2 focus-visible:bg-surface"
      >
        <CloseIcon size={14} strokeWidth={2} />
      </button>
    </div>
  )
}
