import { useMemo } from 'react'
import { todayISO } from '../../lib/dates.ts'
import { useMoves } from '../moves/movesContext.ts'
import { groupForToday } from '../moves/moveRules.ts'

/** Today's Moves, grouped for the Today view, plus progress numbers. */
export function useTodayMoves() {
  const { moves, addMove, toggleMove } = useMoves()
  const today = todayISO()
  const groups = useMemo(() => groupForToday(moves, today), [moves, today])

  return {
    today,
    ...groups,
    doneCount: groups.done.length,
    progress: groups.total ? groups.done.length / groups.total : 0,
    addMove,
    toggleMove,
  }
}
