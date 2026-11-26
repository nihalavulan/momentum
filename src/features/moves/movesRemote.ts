/**
 * Supabase mapping for Moves: rows (snake_case) <-> app Moves (camelCase),
 * plus the two calls the store needs. RLS limits everything to the signed-in user.
 */
import { supabase } from '../../lib/supabase.ts'
import type { Move } from './types.ts'

interface MoveRow {
  id: string
  title: string
  date: string | null
  done: boolean
  done_at: string | null
  arc_id: string | null
  source: 'app' | 'ai'
  created_at: string
}

const COLUMNS = 'id,title,date,done,done_at,arc_id,source,created_at'

function fromRow(r: MoveRow): Move {
  return {
    id: r.id,
    title: r.title,
    date: r.date,
    done: r.done,
    doneAt: r.done_at,
    arcId: r.arc_id,
    createdAt: r.created_at,
    source: r.source,
  }
}

function toRow(m: Move): MoveRow {
  return {
    id: m.id,
    title: m.title,
    date: m.date,
    done: m.done,
    done_at: m.doneAt,
    arc_id: m.arcId ?? null,
    source: m.source,
    created_at: m.createdAt,
  }
}

export async function fetchMoves(): Promise<Move[]> {
  const { data, error } = await supabase.from('moves').select(COLUMNS).order('created_at')
  if (error) throw error
  return (data as MoveRow[]).map(fromRow)
}

/** Insert-or-update (user_id is filled in by the database from the session). */
export async function saveMoves(moves: Move[]): Promise<void> {
  if (moves.length === 0) return
  const { error } = await supabase.from('moves').upsert(moves.map(toRow))
  if (error) throw error
}
