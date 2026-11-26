import { useCallback, useEffect, useState } from 'react'
import { CalendarRange, Flame, Lightbulb, ListTodo, Sun, type LucideIcon } from 'lucide-react'
import { labels } from '../../config/labels.ts'

export type TabId = 'today' | 'moves' | 'arcs' | 'streaks' | 'sparks'

export interface Tab {
  id: TabId
  label: string
  icon: LucideIcon
}

/** Tab order and icons. Names come from labels.ts. */
export const TABS: Tab[] = [
  { id: 'today', label: labels.today.singular, icon: Sun },
  { id: 'moves', label: labels.move.plural, icon: ListTodo },
  { id: 'arcs', label: labels.arc.plural, icon: CalendarRange },
  { id: 'streaks', label: labels.streak.plural, icon: Flame },
  { id: 'sparks', label: labels.spark.plural, icon: Lightbulb },
]

const isTabId = (v: string): v is TabId => TABS.some((t) => t.id === v)

function tabFromHash(): TabId {
  const id = window.location.hash.slice(1)
  return isTabId(id) ? id : 'today'
}

/**
 * Active tab kept in state and mirrored to the URL hash (#arcs) with
 * replaceState: a refresh keeps the tab, and Back doesn't cycle through tabs
 * (like an iOS tab bar). No router needed for five flat tabs.
 */
export function useActiveTab() {
  const [tab, setTab] = useState<TabId>(tabFromHash)

  useEffect(() => {
    const onHash = () => setTab(tabFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const selectTab = useCallback(
    (id: TabId) => {
      if (id === tab) {
        // Tapping the active tab scrolls back to the top, like iOS.
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      window.history.replaceState(null, '', id === 'today' ? window.location.pathname : `#${id}`)
      window.scrollTo({ top: 0 })
      setTab(id)
    },
    [tab],
  )

  return [tab, selectTab] as const
}
