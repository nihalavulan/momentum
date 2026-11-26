import { createContext, useContext } from 'react'
import type { SpaceColor } from '../../config/spaceColors.ts'
import type { Space } from './types.ts'

/** The contract every Spaces data source must meet (Supabase now, PowerSync later). */
export interface SpacesStore {
  /** Every Space, archived included, in order. */
  spaces: Space[]
  /** Not archived, in order: what pickers and filters show. */
  active: Space[]
  getSpace: (id: string | null | undefined) => Space | undefined
  /** Creates a Space (next free colour if none given). Returns null if the name is empty. */
  addSpace: (name: string, color?: SpaceColor) => Space | null
  /** Returns false (and changes nothing) if the name is empty. */
  renameSpace: (id: string, name: string) => boolean
  setSpaceColor: (id: string, color: SpaceColor) => void
  /** Moves a Space one place up (-1) or down (+1) among the active ones. */
  shiftSpace: (id: string, by: -1 | 1) => void
  setSpaceArchived: (id: string, archived: boolean) => void
}

export const SpacesContext = createContext<SpacesStore | null>(null)

export function useSpaces(): SpacesStore {
  const store = useContext(SpacesContext)
  if (!store) throw new Error('useSpaces must be used inside <SpacesProvider>')
  return store
}

/** Ask the app shell to open the Spaces manager (listened to in App). */
export const OPEN_SPACES_EVENT = 'momentum:open-spaces'

export function openSpacesManager() {
  window.dispatchEvent(new Event(OPEN_SPACES_EVENT))
}
