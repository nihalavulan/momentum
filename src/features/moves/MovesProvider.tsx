import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { todayISO, type ISODate } from '../../lib/dates.ts'
import { MovesContext, type MovesStore } from './movesContext.ts'
import { normalizeMoveTitle } from './moveRules.ts'
import { createSampleMoves } from './sampleMoves.ts'
import type { Move } from './types.ts'

/**
 * Holds all Moves in memory for now. Every change is applied to state
 * immediately (optimistic), so the UI never waits.
 *
 * Swap point for PowerSync: replace this provider's internals with local-DB
 * queries and writes, and keep the same `MovesStore` shape. No UI changes needed.
 */
export function MovesProvider({ children }: { children: ReactNode }) {
  const [moves, setMoves] = useState<Move[]>(createSampleMoves)

  const addMove = useCallback((rawTitle: string, date: ISODate | null = todayISO(), options?: { arcId?: string | null }) => {
    const title = normalizeMoveTitle(rawTitle)
    if (!title) return null
    const move: Move = {
      id: crypto.randomUUID(),
      title,
      date,
      done: false,
      doneAt: null,
      arcId: options?.arcId ?? null,
      createdAt: new Date().toISOString(),
      source: 'app',
    }
    setMoves((prev) => [...prev, move])
    return move
  }, [])

  const toggleMove = useCallback((id: string) => {
    setMoves((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, done: !m.done, doneAt: m.done ? null : new Date().toISOString() }
          : m,
      ),
    )
  }, [])

  const moveToDay = useCallback((id: string, date: ISODate | null) => {
    setMoves((prev) => prev.map((m) => (m.id === id ? { ...m, date } : m)))
  }, [])

  const store = useMemo<MovesStore>(
    () => ({ moves, addMove, toggleMove, moveToDay }),
    [moves, addMove, toggleMove, moveToDay],
  )

  return <MovesContext.Provider value={store}>{children}</MovesContext.Provider>
}
