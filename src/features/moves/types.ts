import type { ISODate } from '../../lib/dates.ts'

/** Who created an item: the app UI, or an AI via the future MCP server. */
export type ItemSource = 'app' | 'ai'

export interface Move {
  id: string
  title: string
  /** The day this Move is planned for, or null for a Move with no date. */
  date: ISODate | null
  done: boolean
  /** ISO timestamp of completion, or null when not done. */
  doneAt: string | null
  /** The Arc this Move belongs to, if any. */
  arcId?: string | null
  /** ISO timestamp. */
  createdAt: string
  source: ItemSource
}
