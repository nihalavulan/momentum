import { TABS, type TabId } from './tabs.ts'
import { useHideOnScroll } from './useHideOnScroll.ts'

/**
 * Mobile bottom bar (hidden on desktop). White, simple icons with labels,
 * primary colour for the active section. Tucks away while scrolling down.
 */
export function TabBar({ active, onSelect }: { active: TabId; onSelect: (id: TabId) => void }) {
  const hidden = useHideOnScroll()

  return (
    <nav
      aria-label="Sections"
      className={[
        'fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden',
        'transition-transform duration-200 ease-out',
        hidden ? 'translate-y-full' : 'translate-y-0',
      ].join(' ')}
    >
      <ul className="mx-auto grid h-[60px] max-w-xl grid-cols-5">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = id === active
          return (
            <li key={id} className="contents">
              <button
                type="button"
                onClick={() => onSelect(id)}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'flex flex-col items-center justify-center gap-1 outline-none transition-colors duration-150',
                  'focus-visible:bg-surface',
                  isActive ? 'text-primary' : 'text-ink-2/80',
                ].join(' ')}
              >
                <Icon size={24} strokeWidth={isActive ? 2.1 : 1.7} />
                <span className={`text-[10.5px] leading-none ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
