import { useEffect, useState } from 'react'
import { readJSON, writeJSON } from './storage.ts'

/**
 * Light / dark theme, chosen per device. Light until someone picks another;
 * "system" follows the phone or computer setting and switches live.
 *
 * index.html runs the same logic inline before the first paint so the page
 * never flashes the wrong colours; keep THEME_KEY and the colours in step.
 */
export type ThemePref = 'system' | 'light' | 'dark'
export type Theme = 'light' | 'dark'

export const THEME_KEY = 'momentum:theme'
const CHANGE_EVENT = 'momentum:theme-change'

/** Browser/status bar colour in dark (matches the dark --color-white). */
const PAGE_COLOR = { dark: '#141414' } as const

const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)')

export function readThemePref(): ThemePref {
  const v = readJSON<string>(THEME_KEY, 'light')
  return v === 'system' || v === 'dark' ? v : 'light'
}

export function resolveTheme(pref: ThemePref): Theme {
  if (pref !== 'system') return pref
  return darkQuery().matches ? 'dark' : 'light'
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.dataset.theme = theme
  // Light keeps the app's own (brand) theme-color; dark puts a dark one first.
  const existing = document.querySelector<HTMLMetaElement>('meta[data-dark-theme-color]')
  if (theme === 'light') return existing?.remove()
  if (existing) return
  const meta = document.createElement('meta')
  meta.name = 'theme-color'
  meta.content = PAGE_COLOR.dark
  meta.setAttribute('data-dark-theme-color', '')
  document.head.prepend(meta)
}

export function setThemePref(pref: ThemePref) {
  writeJSON(THEME_KEY, pref)
  applyTheme(resolveTheme(pref))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

/** Keeps the page in step with the saved choice and, on "system", the device. */
export function useThemePref(): [ThemePref, (pref: ThemePref) => void] {
  const [pref, setPref] = useState<ThemePref>(readThemePref)

  useEffect(() => {
    const onChange = () => setPref(readThemePref())
    window.addEventListener(CHANGE_EVENT, onChange)
    return () => window.removeEventListener(CHANGE_EVENT, onChange)
  }, [])

  useEffect(() => {
    applyTheme(resolveTheme(pref))
    if (pref !== 'system') return
    const q = darkQuery()
    const onSystem = () => applyTheme(resolveTheme('system'))
    q.addEventListener('change', onSystem)
    return () => q.removeEventListener('change', onSystem)
  }, [pref])

  return [pref, setThemePref]
}
