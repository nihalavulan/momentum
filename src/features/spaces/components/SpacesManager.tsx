import { useState, type ReactNode } from 'react'
import { labels } from '../../../config/labels.ts'
import { SPACE_COLORS, spaceDot, type SpaceColor } from '../../../config/spaceColors.ts'
import { haptic } from '../../../lib/haptics.ts'
import { ChevronDownIcon } from '../../../components/ui/icons.tsx'
import { useSpaces } from '../spacesContext.ts'
import { SPACE_NAME_MAX } from '../spaceRules.ts'
import type { Space } from '../types.ts'
import { SpaceDot } from './SpaceDot.tsx'

/**
 * Create, rename, recolour, reorder and archive Spaces. Names save as you
 * leave the field (or press Enter); an empty name puts the old one back.
 */
export function SpacesManager() {
  const { spaces, active, addSpace } = useSpaces()
  const archived = spaces.filter((s) => s.archived)
  const [name, setName] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  return (
    <div>
      {active.length === 0 ? (
        <p className="text-[14px] text-ink-2">
          Group your {labels.move.plural} by life area, like Work or Personal.
        </p>
      ) : (
        <ul className="-mx-2 space-y-0.5" aria-label={labels.space.plural}>
          {active.map((space, i) => (
            <SpaceRow key={space.id} space={space} isFirst={i === 0} isLast={i === active.length - 1} />
          ))}
        </ul>
      )}

      <form
        className="mt-4 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (addSpace(name)) {
            haptic('light')
            setName('')
          }
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={SPACE_NAME_MAX}
          enterKeyHint="done"
          autoComplete="off"
          aria-label={`New ${labels.space.singular}`}
          placeholder={`New ${labels.space.singular}`}
          className="h-11 min-w-0 flex-1 rounded-xl bg-surface px-3.5 text-[16px] text-ink outline-none placeholder:text-ink-3 focus-visible:ring-2 focus-visible:ring-primary/30"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="h-11 shrink-0 rounded-full bg-primary px-5 text-[15px] font-semibold text-on-primary outline-none transition-colors duration-150 hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:opacity-40 disabled:hover:bg-primary"
        >
          Add
        </button>
      </form>

      {archived.length > 0 && (
        <section className="mt-5 border-t border-line pt-3">
          <button
            type="button"
            onClick={() => setShowArchived((o) => !o)}
            aria-expanded={showArchived}
            className="-mx-2 flex h-9 items-center gap-1.5 rounded-full px-2 text-[14px] font-semibold text-ink-2 outline-none hover:text-ink focus-visible:bg-surface"
          >
            Archived ({archived.length})
            <ChevronDownIcon
              size={15}
              strokeWidth={2.2}
              className={`transition-transform duration-150 ${showArchived ? 'rotate-180' : ''}`}
            />
          </button>
          {showArchived && (
            <ul className="fade-enter mt-1 space-y-0.5">
              {archived.map((space) => (
                <ArchivedRow key={space.id} space={space} />
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}

function SpaceRow({ space, isFirst, isLast }: { space: Space; isFirst: boolean; isLast: boolean }) {
  const { renameSpace, setSpaceColor, shiftSpace, setSpaceArchived } = useSpaces()
  const [draft, setDraft] = useState(space.name)
  const [editing, setEditing] = useState(false)
  const [pickingColor, setPickingColor] = useState(false)
  const value = editing ? draft : space.name

  const commit = () => {
    setEditing(false)
    if (!renameSpace(space.id, draft)) setDraft(space.name)
  }

  return (
    <li className="rounded-xl">
      <div className="flex items-center gap-1 px-1">
        <button
          type="button"
          onClick={() => setPickingColor((o) => !o)}
          aria-expanded={pickingColor}
          aria-label={`Colour for ${space.name}`}
          className="grid size-10 shrink-0 place-items-center rounded-full outline-none hover:bg-surface focus-visible:bg-surface"
        >
          <SpaceDot color={space.color} size={12} />
        </button>
        <input
          value={value}
          onFocus={() => {
            setDraft(space.name)
            setEditing(true)
          }}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur()
            if (e.key === 'Escape') {
              setDraft(space.name)
              setEditing(false)
              e.currentTarget.blur()
            }
          }}
          maxLength={SPACE_NAME_MAX}
          aria-label={`Rename ${space.name}`}
          className="h-10 min-w-0 flex-1 rounded-lg bg-transparent px-1.5 text-[15px] text-ink outline-none hover:bg-surface/70 focus-visible:bg-surface"
        />
        <IconButton label={`Move ${space.name} up`} disabled={isFirst} onClick={() => shiftSpace(space.id, -1)}>
          <ChevronDownIcon size={16} strokeWidth={2.2} className="rotate-180" />
        </IconButton>
        <IconButton label={`Move ${space.name} down`} disabled={isLast} onClick={() => shiftSpace(space.id, 1)}>
          <ChevronDownIcon size={16} strokeWidth={2.2} />
        </IconButton>
        <button
          type="button"
          onClick={() => {
            haptic('warning')
            setSpaceArchived(space.id, true)
          }}
          className="h-8 shrink-0 rounded-full px-2.5 text-[13px] font-medium text-ink-2 outline-none hover:bg-surface hover:text-ink focus-visible:bg-surface"
        >
          Archive
        </button>
      </div>

      {pickingColor && (
        <div className="fade-enter flex flex-wrap gap-1 pt-1 pb-2 pl-11" role="group" aria-label={`Colour for ${space.name}`}>
          {SPACE_COLORS.map((c) => (
            <ColorSwatch
              key={c.key}
              color={c.key}
              name={c.name}
              selected={space.color === c.key}
              onClick={() => {
                haptic('selection')
                setSpaceColor(space.id, c.key)
                setPickingColor(false)
              }}
            />
          ))}
        </div>
      )}
    </li>
  )
}

function ArchivedRow({ space }: { space: Space }) {
  const { setSpaceArchived } = useSpaces()
  return (
    <li className="flex items-center gap-3 px-1">
      <span className="grid size-10 shrink-0 place-items-center">
        <SpaceDot color={space.color} size={10} className="opacity-50" />
      </span>
      <span className="min-w-0 flex-1 truncate text-[15px] text-ink-2">{space.name}</span>
      <button
        type="button"
        onClick={() => {
          haptic('light')
          setSpaceArchived(space.id, false)
        }}
        className="h-8 shrink-0 rounded-full px-2.5 text-[13px] font-semibold text-ink outline-none hover:bg-surface focus-visible:bg-surface"
      >
        Restore
      </button>
    </li>
  )
}

function ColorSwatch({
  color,
  name,
  selected,
  onClick,
}: {
  color: SpaceColor
  name: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={name}
      title={name}
      className="grid size-9 place-items-center rounded-full outline-none hover:bg-surface focus-visible:bg-surface"
    >
      <span
        className={`block size-5 rounded-full ${selected ? 'ring-2 ring-ink ring-offset-2' : ''}`}
        style={{ backgroundColor: spaceDot(color) }}
      />
    </button>
  )
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={() => {
        haptic('selection')
        onClick()
      }}
      className="grid size-8 shrink-0 place-items-center rounded-full text-ink-2 outline-none hover:bg-surface hover:text-ink focus-visible:bg-surface disabled:opacity-25 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  )
}
