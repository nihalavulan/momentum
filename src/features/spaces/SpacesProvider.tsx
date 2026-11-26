import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { SpaceColor } from '../../config/spaceColors.ts'
import { readJSON, writeJSON } from '../../lib/storage.ts'
import { SpacesContext, type SpacesStore } from './spacesContext.ts'
import { activeSpaces, bySpaceOrder, nextSpaceColor, nextSpacePosition, normalizeSpaceName } from './spaceRules.ts'
import { fetchSpaces, saveSpaces } from './spacesRemote.ts'
import type { Space } from './types.ts'

const SAVE_DELAY_MS = 300
const RETRY_MS = 15_000

/**
 * The signed-in person's Spaces, local-first (same pattern as MovesProvider):
 * - Opens instantly from a copy cached on this device, then refreshes from Supabase.
 * - Every change updates the screen immediately and is queued; the queue is saved
 *   to Supabase in the background and retried until it lands.
 * - Unsaved changes survive a reload (the queue is cached too).
 */
export function SpacesProvider({ userKey, children }: { userKey: string; children: ReactNode }) {
  const cacheKey = `momentum:spaces:${userKey}`
  const queueKey = `momentum:spaces-unsaved:${userKey}`

  const [spaces, setSpaces] = useState<Space[]>(() => readJSON<Space[]>(cacheKey, []))
  const spacesRef = useRef(spaces)
  const unsaved = useRef(new Set<string>(readJSON<string[]>(queueKey, [])))
  const saving = useRef(false)
  const timer = useRef<number | undefined>(undefined)
  const flushRef = useRef<() => Promise<void>>(async () => {})

  const schedule = useCallback((delay: number) => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => void flushRef.current(), delay)
  }, [])

  const flush = useCallback(async () => {
    if (saving.current || unsaved.current.size === 0) return
    saving.current = true
    const batch = spacesRef.current.filter((s) => unsaved.current.has(s.id))
    try {
      await saveSpaces(batch)
      // Clear only what was sent unchanged; edits made during the save stay queued.
      for (const sent of batch) {
        if (spacesRef.current.find((s) => s.id === sent.id) === sent) unsaved.current.delete(sent.id)
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
      const remote = await fetchSpaces()
      // Local changes not saved yet win over what the server has.
      const pending = spacesRef.current.filter((s) => unsaved.current.has(s.id))
      const next = [...remote.filter((s) => !unsaved.current.has(s.id)), ...pending].sort(bySpaceOrder)
      spacesRef.current = next
      setSpaces(next)
    } catch {
      // Offline or server unreachable: keep showing the cached copy.
    }
    void flush()
  }, [flush])

  // Cache every change on the device.
  useEffect(() => writeJSON(cacheKey, spaces), [cacheKey, spaces])

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

  /** Apply a change on screen now, and queue the touched Spaces for saving. */
  const change = useCallback(
    (ids: string[], update: (prev: Space[]) => Space[]) => {
      const next = update(spacesRef.current).sort(bySpaceOrder)
      spacesRef.current = next
      setSpaces(next)
      ids.forEach((id) => unsaved.current.add(id))
      writeJSON(queueKey, [...unsaved.current])
      schedule(SAVE_DELAY_MS)
    },
    [queueKey, schedule],
  )

  const patch = useCallback(
    (id: string, fields: Partial<Space>) => change([id], (prev) => prev.map((s) => (s.id === id ? { ...s, ...fields } : s))),
    [change],
  )

  const addSpace = useCallback(
    (rawName: string, color?: SpaceColor) => {
      const name = normalizeSpaceName(rawName)
      if (!name) return null
      const current = spacesRef.current
      const space: Space = {
        id: crypto.randomUUID(),
        name,
        color: color ?? nextSpaceColor(current),
        position: nextSpacePosition(current),
        archived: false,
        source: 'app',
        createdAt: new Date().toISOString(),
      }
      change([space.id], (prev) => [...prev, space])
      return space
    },
    [change],
  )

  const renameSpace = useCallback(
    (id: string, rawName: string) => {
      const name = normalizeSpaceName(rawName)
      if (!name) return false
      if (spacesRef.current.find((s) => s.id === id)?.name !== name) patch(id, { name })
      return true
    },
    [patch],
  )

  const setSpaceColor = useCallback((id: string, color: SpaceColor) => patch(id, { color }), [patch])

  const setSpaceArchived = useCallback(
    (id: string, archived: boolean) =>
      // Restored Spaces go to the end of the list.
      patch(id, archived ? { archived } : { archived, position: nextSpacePosition(spacesRef.current) }),
    [patch],
  )

  const shiftSpace = useCallback(
    (id: string, by: -1 | 1) => {
      const list = activeSpaces(spacesRef.current)
      const i = list.findIndex((s) => s.id === id)
      const j = i + by
      if (i < 0 || j < 0 || j >= list.length) return
      // Renumber the active list so positions are clean, then swap the two.
      const order = list.map((s) => s.id)
      ;[order[i], order[j]] = [order[j], order[i]]
      const changed = order.filter((sid, pos) => list.find((s) => s.id === sid)!.position !== pos)
      change(changed, (prev) =>
        prev.map((s) => {
          const pos = order.indexOf(s.id)
          return pos >= 0 && s.position !== pos ? { ...s, position: pos } : s
        }),
      )
    },
    [change],
  )

  const store = useMemo<SpacesStore>(() => {
    const active = activeSpaces(spaces)
    return {
      spaces,
      active,
      getSpace: (id) => (id ? spaces.find((s) => s.id === id) : undefined),
      addSpace,
      renameSpace,
      setSpaceColor,
      shiftSpace,
      setSpaceArchived,
    }
  }, [spaces, addSpace, renameSpace, setSpaceColor, shiftSpace, setSpaceArchived])

  return <SpacesContext.Provider value={store}>{children}</SpacesContext.Provider>
}
