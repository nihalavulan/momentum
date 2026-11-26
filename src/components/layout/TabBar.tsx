import { TABS, type TabId } from './tabs.ts'

/** Fixed bottom section bar, iOS-style, sitting above the home indicator. */
export function TabBar({ active, onSelect }: { active: TabId; onSelect: (id: TabId) => void }) {
  return (
    <nav
      aria-label="Sections"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-white/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
    >
      <ul className="mx-auto grid h-[54px] max-w-md grid-cols-5 px-2">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = id === active
          return (
            <li key={id} className="contents">
              <button
                type="button"
                onClick={() => onSelect(id)}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'flex flex-col items-center justify-center gap-[3px] rounded-lg outline-none transition-colors duration-150',
                  'focus-visible:bg-surface',
                  isActive ? 'text-primary' : 'text-ink-3 hover:text-ink-2',
                ].join(' ')}
              >
                <Icon size={23} strokeWidth={isActive ? 2 : 1.6} aria-hidden />
                <span className="text-[10.5px] leading-none font-medium tracking-[0.01em]">{label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
