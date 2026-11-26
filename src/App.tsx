import { ComingSoonView } from './components/layout/ComingSoonView.tsx'
import { Sidebar } from './components/layout/Sidebar.tsx'
import { TabBar } from './components/layout/TabBar.tsx'
import { TABS, useActiveTab } from './components/layout/tabs.ts'
import { MovesProvider } from './features/moves/MovesProvider.tsx'
import { MovesView } from './features/moves/MovesView.tsx'
import { TodayView } from './features/today/TodayView.tsx'

/**
 * App shell.
 * Mobile: one column with the bottom bar. Desktop (≥1024px): fixed sidebar
 * and a wide content area (with a side rail at ≥1280px inside Today).
 */
export default function App() {
  const { tab, selectTab, resetKey } = useActiveTab()
  const current = TABS.find((t) => t.id === tab) ?? TABS[0]

  return (
    <MovesProvider>
      <Sidebar active={tab} onSelect={selectTab} />
      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-xl px-5 pb-40 lg:max-w-[1160px] lg:px-14 lg:pb-24">
          {tab === 'today' ? (
            <TodayView key={resetKey} />
          ) : tab === 'moves' ? (
            <MovesView />
          ) : (
            <ComingSoonView title={current.label} icon={current.icon} />
          )}
        </main>
      </div>
      <TabBar active={tab} onSelect={selectTab} />
    </MovesProvider>
  )
}
