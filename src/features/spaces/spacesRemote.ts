/**
 * Supabase mapping for Spaces: rows (snake_case) <-> app Spaces (camelCase),
 * plus the two calls the store needs. RLS limits everything to the signed-in user.
 */
import { DEFAULT_SPACE_COLOR, isSpaceColor } from '../../config/spaceColors.ts'
import { supabase } from '../../lib/supabase.ts'
import type { Space } from './types.ts'

interface SpaceRow {
  id: string
  name: string
  color: string
  position: number
  archived: boolean
  source: 'app' | 'ai'
  created_at: string
}

const COLUMNS = 'id,name,color,position,archived,source,created_at'

function fromRow(r: SpaceRow): Space {
  return {
    id: r.id,
    name: r.name,
    color: isSpaceColor(r.color) ? r.color : DEFAULT_SPACE_COLOR,
    position: r.position,
    archived: r.archived,
    source: r.source,
    createdAt: r.created_at,
  }
}

function toRow(s: Space): SpaceRow {
  return {
    id: s.id,
    name: s.name,
    color: s.color,
    position: s.position,
    archived: s.archived,
    source: s.source,
    created_at: s.createdAt,
  }
}

export async function fetchSpaces(): Promise<Space[]> {
  const { data, error } = await supabase.from('spaces').select(COLUMNS).order('position')
  if (error) throw error
  return (data as SpaceRow[]).map(fromRow)
}

/** Insert-or-update (user_id is filled in by the database from the session). */
export async function saveSpaces(spaces: Space[]): Promise<void> {
  if (spaces.length === 0) return
  const { error } = await supabase.from('spaces').upsert(spaces.map(toRow))
  if (error) throw error
}
