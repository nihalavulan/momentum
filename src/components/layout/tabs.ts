import { useCallback, useEffect, useState } from 'react'
import { labels } from '../../config/labels.ts'
import { ArcsIcon, MovesIcon, SparksIcon, StreaksIcon, TodayIcon, type Icon } from '../ui/icons.tsx'

export type TabId = 'today' | 'moves' | 'arcs' | 'streaks' | 'sparks'

export interface Tab {
  id: TabId
  label: string
  icon: Icon
}

/** Section order and icons. Names come from labels.ts. */
export const TABS: Tab[] = [
  { id: 'today', label: labels.today.singular, icon: TodayIcon },
  { id: 'moves', label: labels.move.plural, icon: MovesIcon },
  { id: 'arcs', label: labels.arc.plural, icon: ArcsIcon },
  { id: 'streaks', label: labels.streak.plural, icon: StreaksIcon },
  { id: 'sparks', label: labels.spark.plural, icon: SparksIcon },
]

const isTabId = (v: string): v is TabId => TABS.some((t) => t.id === v)

function tabFromHash(): TabId {
  const id = window.location.hash.slice(1)
  return isTabId(id) ? id : 'today'
}

/**
 * Active section kept in state and mirrored to the URL hash (#arcs) with
 * replaceState: a refresh keeps the section, and Back doesn't cycle through
 * them (like an iOS tab bar). No router needed for five flat sections.
 *
 * `resetKey` changes when the active section is tapped again, so a view can
 * return to its starting state (e.g. Today jumps back to today).
 */
export function useActiveTab() {
  const [tab, setTab] = useState<TabId>(tabFromHash)
  const [resetKey, setResetKey] = useState(0)

  useEffect(() => {
    const onHash = () => setTab(tabFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const selectTab = useCallback(
    (id: TabId) => {
      if (id === tab) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        setResetKey((k) => k + 1)
        return
      }
      window.history.replaceState(null, '', id === 'today' ? window.location.pathname : `#${id}`)
      window.scrollTo({ top: 0 })
      setTab(id)
    },
    [tab],
  )

  return { tab, selectTab, resetKey }
}
