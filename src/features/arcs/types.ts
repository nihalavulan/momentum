import type { ISODate } from '../../lib/dates.ts'

/** A group of Moves to finish within a period. Only what the UI needs so far. */
export interface Arc {
  id: string
  title: string
  startDate: ISODate
  endDate: ISODate
}
