import type { SpaceColor } from '../../config/spaceColors.ts'
import type { ItemSource } from '../moves/types.ts'

/** A top-level life area (e.g. Work, Personal). Each person creates their own. */
export interface Space {
  id: string
  name: string
  color: SpaceColor
  /** Ordering, lowest first. */
  position: number
  /** Hidden from pickers and filters; Moves keep pointing at it. */
  archived: boolean
  source: ItemSource
  /** ISO timestamp. */
  createdAt: string
}
