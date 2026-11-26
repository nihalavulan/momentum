import { useCallback, useEffect, useState } from 'react'
import { readJSON, writeJSON } from '../../lib/storage.ts'
import { useAuth } from '../auth/authContext.ts'
import { useSpaces } from './spacesContext.ts'

const CHANGE_EVENT = 'momentum:space-filter'

/**
 * Which Space Today shows (null = all), remembered on this device per person.
 * Shared by Today's filter chips and the desktop sidebar, kept in step by an event.
 * A filter pointing at an archived or missing Space reads as "all".
 */
export function useSpaceFilter(): [string | null, (id: string | null) => void] {
  const { user } = useAuth()
  const { active } = useSpaces()
  const key = `momentum:space-filter:${user?.id ?? 'anon'}`
  const [stored, setStored] = useState<string | null>(() => readJSON<string | null>(key, null))

  useEffect(() => {
    const onChange = () => setStored(readJSON<string | null>(key, null))
    window.addEventListener(CHANGE_EVENT, onChange)
    return () => window.removeEventListener(CHANGE_EVENT, onChange)
  }, [key])

  const set = useCallback(
    (id: string | null) => {
      writeJSON(key, id)
      setStored(id)
      window.dispatchEvent(new Event(CHANGE_EVENT))
    },
    [key],
  )

  const valid = stored && active.some((s) => s.id === stored) ? stored : null
  return [valid, set]
}
