import { ComingSoonView } from './components/layout/ComingSoonView.tsx'
import { TabBar } from './components/layout/TabBar.tsx'
import { TABS, useActiveTab } from './components/layout/tabs.ts'
import { MovesProvider } from './features/moves/MovesProvider.tsx'
import { TodayView } from './features/today/TodayView.tsx'

/** App shell: one centred column for the active section, and the bottom section bar. */
export default function App() {
  const [tab, selectTab] = useActiveTab()
  const current = TABS.find((t) => t.id === tab) ?? TABS[0]

  return (
    <MovesProvider>
      {/* Bottom padding clears the tab bar (54px); #root already adds the home-indicator inset. */}
      <main className="mx-auto w-full max-w-md px-5 pb-[84px]">
        {tab === 'today' ? <TodayView /> : <ComingSoonView title={current.label} icon={current.icon} />}
      </main>
      <TabBar active={tab} onSelect={selectTab} />
    </MovesProvider>
  )
}
