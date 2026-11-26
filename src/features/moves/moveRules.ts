/**
 * Business rules for Moves. Pure functions with no React or browser code, so the
 * app UI and the future MCP server can share them.
 */
import { todayISO, type ISODate } from '../../lib/dates.ts'
import type { Move } from './types.ts'

export const MOVE_TITLE_MAX = 200

/** Trims and collapses whitespace. Returns null if the title is empty. */
export function normalizeMoveTitle(raw: string): string | null {
  const title = raw.replace(/\s+/g, ' ').trim()
  if (!title) return null
  return title.slice(0, MOVE_TITLE_MAX)
}

/** Not done, and planned for a day before `today`. */
export function isOverdue(move: Move, today: ISODate = todayISO()): boolean {
  return !move.done && move.date !== null && move.date < today
}

/** Completed during `today` (whatever day it was planned for). */
export function isDoneOn(move: Move, day: ISODate): boolean {
  return move.done && move.doneAt != null && move.doneAt.slice(0, 10) === day
}

export interface TodayGroups {
  overdue: Move[]
  open: Move[]
  done: Move[]
  /** Everything that counts towards today's progress. */
  total: number
}

/**
 * Splits Moves into what the Today view shows:
 * - overdue: open Moves from earlier days, oldest first
 * - open: today's Moves that aren't done, in creation order
 * - done: Moves planned for today or completed today, most recent first
 */
export function groupForToday(moves: Move[], today: ISODate = todayISO()): TodayGroups {
  const overdue: Move[] = []
  const open: Move[] = []
  const done: Move[] = []

  for (const move of moves) {
    if (isOverdue(move, today)) overdue.push(move)
    else if (move.date === today && !move.done) open.push(move)
    else if (move.done && (move.date === today || isDoneOn(move, today))) done.push(move)
  }

  overdue.sort((a, b) => (a.date ?? '').localeCompare(b.date ?? '') || a.createdAt.localeCompare(b.createdAt))
  open.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  done.sort((a, b) => (b.doneAt ?? '').localeCompare(a.doneAt ?? ''))

  return { overdue, open, done, total: overdue.length + open.length + done.length }
}

/**
 * Like `groupForToday`, for any day. Earlier unfinished Moves only appear on
 * today; other days show just their own Moves.
 */
export function groupForDay(moves: Move[], day: ISODate, today: ISODate = todayISO()): TodayGroups {
  if (day === today) return groupForToday(moves, today)
  const open: Move[] = []
  const done: Move[] = []
  for (const move of moves) {
    if (move.date !== day) continue
    if (move.done) done.push(move)
    else open.push(move)
  }
  open.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  done.sort((a, b) => (b.doneAt ?? '').localeCompare(a.doneAt ?? ''))
  return { overdue: [], open, done, total: open.length + done.length }
}

/** Done / total for a day, as shown on the week rings. */
export function dayProgress(moves: Move[], day: ISODate, today: ISODate = todayISO()) {
  const g = groupForDay(moves, day, today)
  return { done: g.done.length, total: g.total }
}

/** Moves with no date: open ones first (oldest first), then done (most recent first). */
export function groupUndated(moves: Move[]) {
  const open = moves.filter((m) => m.date === null && !m.done).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const done = moves
    .filter((m) => m.date === null && m.done)
    .sort((a, b) => (b.doneAt ?? '').localeCompare(a.doneAt ?? ''))
  return { open, done }
}
