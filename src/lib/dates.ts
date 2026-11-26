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

/** Monday of the week containing `iso`. */
export function startOfWeek(iso: ISODate): ISODate {
  const d = parseISODate(iso)
  const offset = (d.getDay() + 6) % 7 // Mon = 0
  return addDays(iso, -offset)
}

/** The 7 days (Mon–Sun) of the week starting at `weekStart`. */
export function weekDays(weekStart: ISODate): ISODate[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
}

/** Big page title for a day: "Today", "Tomorrow", "Yesterday", or the weekday name. */
export function formatDayTitle(iso: ISODate, today: ISODate = todayISO()): string {
  if (iso === today) return 'Today'
  if (iso === addDays(today, 1)) return 'Tomorrow'
  if (iso === addDays(today, -1)) return 'Yesterday'
  const d = parseISODate(iso)
  const diff = Math.round((d.getTime() - parseISODate(today).getTime()) / 86_400_000)
  if (Math.abs(diff) < 7) return d.toLocaleDateString('en-GB', { weekday: 'long' })
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
}

/** "November 2026" */
export function formatMonthYear(iso: ISODate): string {
  return parseISODate(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

/** "1–20 Dec", or "21 Nov – 10 Dec" across months. */
export function formatDateRange(start: ISODate, end: ISODate): string {
  const s = parseISODate(start)
  const e = parseISODate(end)
  const month = (d: Date) => d.toLocaleDateString('en-GB', { month: 'short' })
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()}–${e.getDate()} ${month(e)}`
  }
  return `${s.getDate()} ${month(s)} – ${e.getDate()} ${month(e)}`
}

/** Whole days from `from` to `to` (negative if `to` is earlier). */
export function daysBetween(from: ISODate, to: ISODate): number {
  return Math.round((parseISODate(to).getTime() - parseISODate(from).getTime()) / 86_400_000)
}

/** Saturday of this weekend (today if it's already Saturday or Sunday). */
export function upcomingWeekend(today: ISODate = todayISO()): ISODate {
  const dow = parseISODate(today).getDay()
  if (dow === 6 || dow === 0) return today
  return addDays(today, 6 - dow)
}

/** Monday of next week (never today). */
export function nextMonday(today: ISODate = todayISO()): ISODate {
  const dow = parseISODate(today).getDay()
  return addDays(today, ((1 - dow + 7) % 7) || 7)
}
