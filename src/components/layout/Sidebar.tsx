import { brand } from '../../config/brand.ts'
import { useMoves } from '../../features/moves/movesContext.ts'
import { groupForToday, groupUndated } from '../../features/moves/moveRules.ts'
import { AccountMenu } from '../../features/auth/AccountMenu.tsx'
import { BrandSymbol } from '../ui/BrandSymbol.tsx'
import { SidebarSpaces } from '../../features/spaces/components/SidebarSpaces.tsx'
import { TABS, type TabId } from './tabs.ts'

/** Desktop navigation (hidden on mobile): brand, sections, and today's open count. */
export function Sidebar({ active, onSelect }: { active: TabId; onSelect: (id: TabId) => void }) {
  const { moves } = useMoves()
  const g = groupForToday(moves)
  const counts: Partial<Record<TabId, number>> = {
    today: g.overdue.length + g.open.length,
    moves: groupUndated(moves).open.length,
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-line bg-white px-4 pt-7 pb-6 lg:flex">
      <div className="mb-9 flex items-center gap-2.5 px-3">
        <BrandSymbol size={22} className="text-primary" />
        <span className="text-[19px] font-bold tracking-[-0.02em] text-ink">{brand.appName}</span>
      </div>

      <nav aria-label="Sections">
        <ul className="space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = id === active
            const count = counts[id]
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onSelect(id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={[
                    'flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[15px] outline-none transition-colors duration-150',
                    'focus-visible:ring-2 focus-visible:ring-primary/30',
                    isActive ? 'bg-surface font-semibold text-ink' : 'font-medium text-ink-2 hover:bg-surface/70 hover:text-ink',
                  ].join(' ')}
                >
                  <Icon size={21} strokeWidth={isActive ? 2.1 : 1.7} className={isActive ? 'text-primary' : ''} />
                  <span className="flex-1 text-left">{label}</span>
                  {count ? <span className="text-[13px] font-medium text-ink-3 tabular-nums">{count}</span> : null}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <SidebarSpaces onShowToday={() => onSelect('today')} />

      <div className="mt-auto">
        <AccountMenu variant="row" />
      </div>
    </aside>
  )
}
