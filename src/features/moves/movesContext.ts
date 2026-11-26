import { createContext, useContext } from 'react'
import type { ISODate } from '../../lib/dates.ts'
import type { Move } from './types.ts'

/** The contract every Moves data source must meet (in-memory now, PowerSync later). */
export interface MovesStore {
  moves: Move[]
  /** Adds a Move (today by default; pass null for no date). Returns null if the title is empty. */
  addMove: (
    title: string,
    date?: ISODate | null,
    options?: { arcId?: string | null; spaceId?: string | null },
  ) => Move | null
  /** Marks a Move done, or not done again. */
  toggleMove: (id: string) => void
  /** Reschedules a Move to another day, or to no date (keeps it open). */
  moveToDay: (id: string, date: ISODate | null) => void
  /** Puts a Move in a Space (or none). A Move inside an Arc always keeps the Arc's Space. */
  setMoveSpace: (id: string, spaceId: string | null) => void
}

export const MovesContext = createContext<MovesStore | null>(null)

export function useMoves(): MovesStore {
  const store = useContext(MovesContext)
  if (!store) throw new Error('useMoves must be used inside <MovesProvider>')
  return store
}
