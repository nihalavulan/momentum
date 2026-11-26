/**
 * Picks a date out of a Move title as it's typed, e.g.
 *   "Call supplier fri"        → Friday (this coming one, today if it's Friday)
 *   "Send invoice 12 dec"      → 12 December (next year if already past)
 *   "Gym tomorrow" / "tmrw"    → tomorrow
 *   "Pay rent next week"       → next Monday
 *   "Clean car this weekend"   → Saturday (today if it's already the weekend)
 *   "Renew passport in 10 days"
 *   "Dentist next tue"         → the coming Tuesday (never today)
 *
 * Short day names ("sat", "wed") only count at the end of the title, so
 * "Sat down with Ali" stays as text; full names ("saturday") count anywhere.
 *
 * Pure function with no React, so the future MCP server can use the same rules.
 * The last date phrase in the title wins; it's removed from the returned title
 * along with a leading "on" / "by" / "due".
 */
import { addDays, parseISODate, toISODate, type ISODate } from '../../lib/dates.ts'

export interface ParsedMoveDate {
  date: ISODate
  /** The phrase as typed, e.g. "fri". */
  phrase: string
  /** The title with the phrase removed. */
  title: string
}

const WEEKDAY = '(sun(?:day)?|mon(?:day)?|tue(?:s(?:day)?)?|wed(?:nesday)?|thu(?:r(?:s(?:day)?)?)?|fri(?:day)?|sat(?:urday)?)'
const MONTH =
  '(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)'
const ORD = '(?:st|nd|rd|th)?'
const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

/** The next `weekday` (0 = Sun) from `today`; today itself counts if `includeToday`. */
function upcoming(today: ISODate, weekday: number, includeToday: boolean): ISODate {
  let diff = (weekday - parseISODate(today).getDay() + 7) % 7
  if (diff === 0 && !includeToday) diff = 7
  return addDays(today, diff)
}

function monthDay(today: ISODate, month: number, day: number): ISODate | null {
  const year = parseISODate(today).getFullYear()
  const make = (y: number) => {
    const d = new Date(y, month, day)
    return d.getMonth() === month ? toISODate(d) : null // rejects 31 Feb etc.
  }
  const thisYear = make(year)
  if (!thisYear) return null
  return thisYear >= today ? thisYear : make(year + 1)
}

type Rule = { re: RegExp; resolve: (m: RegExpExecArray, today: ISODate) => ISODate | null }

const RULES: Rule[] = [
  { re: /\btoday\b/g, resolve: (_, t) => t },
  { re: /\b(?:tomorrow|tmrw?|tmr)\b/g, resolve: (_, t) => addDays(t, 1) },
  {
    re: /\b(?:this )?weekend\b/g,
    resolve: (_, t) => {
      const dow = parseISODate(t).getDay()
      return dow === 6 || dow === 0 ? t : upcoming(t, 6, false)
    },
  },
  { re: /\bnext week\b/g, resolve: (_, t) => upcoming(t, 1, false) },
  { re: /\bin (\d{1,3}) days?\b/g, resolve: (m, t) => addDays(t, Number(m[1])) },
  { re: /\bin a week\b/g, resolve: (_, t) => addDays(t, 7) },
  {
    re: new RegExp(`\\bnext ${WEEKDAY}\\b`, 'g'),
    resolve: (m, t) => upcoming(t, WEEKDAYS.indexOf(m[1].slice(0, 3)), false),
  },
  {
    re: new RegExp(`\\b(?:this )?${WEEKDAY}\\b`, 'g'),
    resolve: (m, t) => {
      // Short forms ("sat", "wed") are common words; only trust them at the end of the title.
      const isShort = m[1].length <= 4
      const atEnd = m.input.slice(m.index + m[0].length).trim() === ''
      if (isShort && !atEnd) return null
      return upcoming(t, WEEKDAYS.indexOf(m[1].slice(0, 3)), true)
    },
  },
  {
    re: new RegExp(`\\b(\\d{1,2})${ORD} ${MONTH}\\b`, 'g'),
    resolve: (m, t) => monthDay(t, MONTHS.indexOf(m[2].slice(0, 3)), Number(m[1])),
  },
  {
    re: new RegExp(`\\b${MONTH} (\\d{1,2})${ORD}\\b`, 'g'),
    resolve: (m, t) => monthDay(t, MONTHS.indexOf(m[1].slice(0, 3)), Number(m[2])),
  },
]

export function parseMoveDate(raw: string, today: ISODate): ParsedMoveDate | null {
  const lower = raw.toLowerCase()
  let best: { index: number; length: number; date: ISODate } | null = null

  for (const rule of RULES) {
    rule.re.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = rule.re.exec(lower))) {
      const date = rule.resolve(m, today)
      if (!date) continue
      // Prefer the phrase that ends last; on a tie, the longer one ("next fri" over "fri").
      const end = m.index + m[0].length
      const bestEnd = best ? best.index + best.length : -1
      if (!best || end > bestEnd || (end === bestEnd && m[0].length > best.length)) {
        best = { index: m.index, length: m[0].length, date }
      }
    }
  }
  if (!best) return null

  // Also swallow a connector word right before the phrase ("… on fri", "… by 12 dec").
  let start = best.index
  const before = lower.slice(0, start)
  const connector = /\b(?:on|by|due)\s+$/.exec(before)
  if (connector) start = connector.index

  const title = (raw.slice(0, start) + raw.slice(best.index + best.length)).replace(/\s+/g, ' ').trim()
  if (!title) return null // the whole title was a date ("tomorrow"): treat it as text

  return { date: best.date, phrase: raw.slice(best.index, best.index + best.length), title }
}
