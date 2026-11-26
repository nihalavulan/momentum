/** Business rules for Arcs. Pure functions, shared by the UI and (later) the MCP server. */
import { daysBetween, todayISO, type ISODate } from '../../lib/dates.ts'
import type { Move } from '../moves/types.ts'
import type { Arc } from './types.ts'

/** Arc progress = completed Moves ÷ total Moves in the Arc. */
export function arcProgress(moves: Move[], arcId: string) {
  let total = 0
  let done = 0
  for (const m of moves) {
    if (m.arcId !== arcId) continue
    total++
    if (m.done) done++
  }
  return { total, done, ratio: total ? done / total : 0 }
}

/** Days left until the Arc ends (0 on the last day, negative once it's over). */
export function arcDaysLeft(arc: Arc, today: ISODate = todayISO()): number {
  return daysBetween(today, arc.endDate)
}

export function isArcActive(arc: Arc, today: ISODate = todayISO()): boolean {
  return arc.startDate <= today && today <= arc.endDate
}
