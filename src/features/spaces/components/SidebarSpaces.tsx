import { labels } from '../../../config/labels.ts'
import { PlusIcon } from '../../../components/ui/icons.tsx'
import { openSpacesManager, useSpaces } from '../spacesContext.ts'
import { useSpaceFilter } from '../useSpaceFilter.ts'
import { SpaceDot } from './SpaceDot.tsx'

/**
 * Desktop sidebar section: the person's Spaces. Clicking one shows Today for
 * just that Space (click again for all); "Edit" opens the manager.
 */
export function SidebarSpaces({ onShowToday }: { onShowToday: () => void }) {
  const { active } = useSpaces()
  const [filter, setFilter] = useSpaceFilter()

  return (
    <section className="mt-8" aria-label={labels.space.plural}>
      <div className="mb-1 flex items-center justify-between px-3">
        <h2 className="text-[13px] font-semibold text-ink-3">{labels.space.plural}</h2>
        {active.length > 0 && (
          <button
            type="button"
            onClick={openSpacesManager}
            className="rounded-md px-1 text-[13px] font-semibold text-ink-2 outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            Edit
          </button>
        )}
      </div>

      <ul className="space-y-0.5">
        {active.map((space) => {
          const isActive = filter === space.id
          return (
            <li key={space.id}>
              <button
                type="button"
                onClick={() => {
                  setFilter(isActive ? null : space.id)
                  onShowToday()
                }}
                aria-pressed={isActive}
                className={[
                  'flex h-9 w-full items-center gap-3 rounded-xl px-3 text-[14px] outline-none transition-colors duration-150',
                  'focus-visible:ring-2 focus-visible:ring-primary/30',
                  isActive ? 'bg-surface font-semibold text-ink' : 'font-medium text-ink-2 hover:bg-surface/70 hover:text-ink',
                ].join(' ')}
              >
                <span className="grid w-[21px] place-items-center">
                  <SpaceDot color={space.color} size={9} />
                </span>
                <span className="min-w-0 flex-1 truncate text-left">{space.name}</span>
              </button>
            </li>
          )
        })}
        {active.length === 0 && (
          <li>
            <button
              type="button"
              onClick={openSpacesManager}
              className="flex h-9 w-full items-center gap-3 rounded-xl px-3 text-[14px] font-medium text-ink-2 outline-none hover:bg-surface/70 hover:text-ink focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <span className="grid w-[21px] place-items-center">
                <PlusIcon size={16} strokeWidth={2} />
              </span>
              New {labels.space.singular}
            </button>
          </li>
        )}
      </ul>
    </section>
  )
}
