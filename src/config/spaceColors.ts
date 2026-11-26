/**
 * Space colours — the ONLY place they're defined. A small set of muted dot
 * colours, deliberately not brand colours (orange stays for main actions).
 *
 * Keys are stored in the database: keep them in sync with the check on
 * `spaces.color` in supabase/migrations/20261127000000_spaces.sql.
 */
export const SPACE_COLORS = [
  { key: 'slate', name: 'Slate', dot: '#8A94A6' },
  { key: 'sage', name: 'Sage', dot: '#86A68C' },
  { key: 'sky', name: 'Sky', dot: '#7FA6CC' },
  { key: 'lavender', name: 'Lavender', dot: '#A192C9' },
  { key: 'sand', name: 'Sand', dot: '#C7A877' },
  { key: 'rose', name: 'Rose', dot: '#C98F9A' },
  { key: 'teal', name: 'Teal', dot: '#6FA9A2' },
  { key: 'stone', name: 'Stone', dot: '#A8A196' },
] as const

export type SpaceColor = (typeof SPACE_COLORS)[number]['key']

export const DEFAULT_SPACE_COLOR: SpaceColor = 'slate'

export function isSpaceColor(value: unknown): value is SpaceColor {
  return SPACE_COLORS.some((c) => c.key === value)
}

/** The Space colour as a soft background tint, e.g. for #tag pills. */
export function spaceTint(key: string | null | undefined, alpha = 0.22): string {
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0')
  return `${spaceDot(key)}${a}`
}

/** The dot's hex value for a colour key (falls back to the default). */
export function spaceDot(key: string | null | undefined): string {
  return (SPACE_COLORS.find((c) => c.key === key) ?? SPACE_COLORS[0]).dot
}
