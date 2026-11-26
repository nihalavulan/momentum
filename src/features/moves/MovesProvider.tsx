import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { todayISO, type ISODate } from '../../lib/dates.ts'
import { readJSON, writeJSON } from '../../lib/storage.ts'
import { MovesContext, type MovesStore } from './movesContext.ts'
import { normalizeMoveTitle } from './moveRules.ts'
import { fetchMoves, saveMoves } from './movesRemote.ts'
import type { Move } from './types.ts'
import { useArcs } from '../arcs/useArcs.ts'
import { effectiveSpaceId } from '../spaces/spaceRules.ts'

const SAVE_DELAY_MS = 300
const RETRY_MS = 15_000

/**
 * The signed-in person's Moves, local-first:
 * - Opens instantly from a copy cached on this device, then refreshes from Supabase.
 * - Every change updates the screen immediately and is queued; the queue is saved
 *   to Supabase in the background and retried (offline, flaky network) until it lands.
 * - Unsaved changes survive a reload (the queue is cached too).
 *
 * Swap point for PowerSync: replace these internals, keep the `MovesStore` shape.
 */
export function MovesProvider({ userKey, children }: { userKey: string; children: ReactNode }) {
  const cacheKey = `momentum:moves:${userKey}`
  const queueKey = `momentum:moves-unsaved:${userKey}`

  const [moves, setMoves] = useState<Move[]>(() => readJSON<Move[]>(cacheKey, []))
  const movesRef = useRef(moves)
  const unsaved = useRef(new Set<string>(readJSON<string[]>(queueKey, [])))
  const saving = useRef(false)
  const timer = useRef<number | undefined>(undefined)
  const flushRef = useRef<() => Promise<void>>(async () => {})
  const { arcs } = useArcs()

  const schedule = useCallback((delay: number) => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => void flushRef.current(), delay)
  }, [])

  const flush = useCallback(async () => {
    if (saving.current || unsaved.current.size === 0) return
    saving.current = true
    const batch = movesRef.current.filter((m) => unsaved.current.has(m.id))
    try {
      await saveMoves(batch)
      // Clear only what was sent unchanged; edits made during the save stay queued.
      for (const sent of batch) {
        if (movesRef.current.find((m) => m.id === sent.id) === sent) unsaved.current.delete(sent.id)
      }
      writeJSON(queueKey, [...unsaved.current])
      if (unsaved.current.size > 0) schedule(SAVE_DELAY_MS)
    } catch {
      schedule(RETRY_MS)
    } finally {
      saving.current = false
    }
  }, [queueKey, schedule])
  useEffect(() => {
    flushRef.current = flush
  }, [flush])

  const refresh = useCallback(async () => {
    try {
      const remote = await fetchMoves()
      // Local changes not saved yet win over what the server has.
      const pending = movesRef.current.filter((m) => unsaved.current.has(m.id))
      const next = [...remote.filter((m) => !unsaved.current.has(m.id)), ...pending]
      movesRef.current = next
      setMoves(next)
    } catch {
      // Offline or server unreachable: keep showing the cached copy.
    }
    void flush()
  }, [flush])

  // Cache every change on the device.
  useEffect(() => writeJSON(cacheKey, moves), [cacheKey, moves])

  // Load on start, and again when the app comes back to the foreground or online.
  useEffect(() => {
    void refresh()
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh()
    }
    const onOnline = () => void refresh()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('online', onOnline)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('online', onOnline)
      window.clearTimeout(timer.current)
    }
  }, [refresh])

  /** Apply a change on screen now, and queue the touched Moves for saving. */
  const change = useCallback(
    (id: string, update: (prev: Move[]) => Move[]) => {
      const next = update(movesRef.current)
      movesRef.current = next
      setMoves(next)
      unsaved.current.add(id)
      writeJSON(queueKey, [...unsaved.current])
      schedule(SAVE_DELAY_MS)
    },
    [queueKey, schedule],
  )

  const addMove = useCallback(
    (
      rawTitle: string,
      date: ISODate | null = todayISO(),
      options?: { arcId?: string | null; spaceId?: string | null },
    ) => {
      const title = normalizeMoveTitle(rawTitle)
      if (!title) return null
      const move: Move = {
        id: crypto.randomUUID(),
        title,
        date,
        done: false,
        doneAt: null,
        arcId: options?.arcId ?? null,
        spaceId: effectiveSpaceId({ arcId: options?.arcId, spaceId: options?.spaceId }, arcs),
        createdAt: new Date().toISOString(),
        source: 'app',
      }
      change(move.id, (prev) => [...prev, move])
      return move
    },
    [change, arcs],
  )

  const toggleMove = useCallback(
    (id: string) => {
      change(id, (prev) =>
        prev.map((m) => (m.id === id ? { ...m, done: !m.done, doneAt: m.done ? null : new Date().toISOString() } : m)),
      )
    },
    [change],
  )

  const moveToDay = useCallback(
    (id: string, date: ISODate | null) => {
      change(id, (prev) => prev.map((m) => (m.id === id ? { ...m, date } : m)))
    },
    [change],
  )

  const setMoveSpace = useCallback(
    (id: string, spaceId: string | null) => {
      const move = movesRef.current.find((m) => m.id === id)
      if (!move) return
      const next = effectiveSpaceId({ arcId: move.arcId, spaceId }, arcs)
      if ((move.spaceId ?? null) === next) return
      change(id, (prev) => prev.map((m) => (m.id === id ? { ...m, spaceId: next } : m)))
    },
    [change, arcs],
  )

  const store = useMemo<MovesStore>(
    () => ({ moves, addMove, toggleMove, moveToDay, setMoveSpace }),
    [moves, addMove, toggleMove, moveToDay, setMoveSpace],
  )

  return <MovesContext.Provider value={store}>{children}</MovesContext.Provider>
}
