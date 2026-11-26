/**
 * Date helpers. Moves are dated with local calendar days as 'YYYY-MM-DD'
 * strings (no time zone surprises, sortable as plain strings).
 */
export type ISODate = string

export function toISODate(d: Date): ISODate {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayISO(): ISODate {
  return toISODate(new Date())
}

export function parseISODate(iso: ISODate): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(iso: ISODate, days: number): ISODate {
  const d = parseISODate(iso)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

/** "Thursday, 26 Nov" */
export function formatLongDate(iso: ISODate): string {
  const d = parseISODate(iso)
  const weekday = d.toLocaleDateString('en-GB', { weekday: 'long' })
  const dayMonth = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return `${weekday}, ${dayMonth}`
}

/** Relative to today: "Yesterday", or "Tue 24 Nov". */
export function formatRelativeDay(iso: ISODate, today: ISODate = todayISO()): string {
  if (iso === addDays(today, -1)) return 'Yesterday'
  if (iso === today) return 'Today'
  if (iso === addDays(today, 1)) return 'Tomorrow'
  return parseISODate(iso).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}
