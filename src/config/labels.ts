/**
 * Feature labels — the ONLY place user-facing feature names are defined.
 * Rename a concept here and it changes across the whole UI.
 */
export const labels = {
  move: { singular: 'Move', plural: 'Moves' },
  today: { singular: 'Today', plural: 'Today' },
  arc: { singular: 'Arc', plural: 'Arcs' },
  streak: { singular: 'Streak', plural: 'Streaks' },
  spark: { singular: 'Spark', plural: 'Sparks' },
  space: { singular: 'Space', plural: 'Spaces' },
} as const

export type FeatureKey = keyof typeof labels
