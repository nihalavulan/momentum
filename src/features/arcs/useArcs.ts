import { addDays, todayISO } from '../../lib/dates.ts'
import type { Arc } from './types.ts'

/**
 * Temporary sample Arcs (read-only) until the real data layer exists.
 * Swap this hook's internals for PowerSync later; callers stay the same.
 */
const today = todayISO()

const SAMPLE_ARCS: Arc[] = [
  { id: 'arc-zawj', title: 'Dec 23 Zawj batch', startDate: addDays(today, -5), endDate: addDays(today, 14) },
  { id: 'arc-portfolio', title: 'Portfolio refresh', startDate: addDays(today, -10), endDate: addDays(today, 20) },
]

const ARCS_BY_ID = new Map(SAMPLE_ARCS.map((arc) => [arc.id, arc]))

export function useArcs() {
  return {
    arcs: SAMPLE_ARCS,
    getArc: (id: string | null | undefined) => (id ? ARCS_BY_ID.get(id) : undefined),
  }
}
