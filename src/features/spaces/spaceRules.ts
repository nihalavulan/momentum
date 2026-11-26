/**
 * Business rules for Spaces. Pure functions with no React or browser code, so
 * the app UI and the future MCP server can share them.
 */
import { SPACE_COLORS, type SpaceColor } from '../../config/spaceColors.ts'
import type { Arc } from '../arcs/types.ts'
import type { Space } from './types.ts'

export const SPACE_NAME_MAX = 40

/** Trims and collapses whitespace. Returns null if empty; cuts to 40 characters. */
export function normalizeSpaceName(raw: string): string | null {
  const name = raw.replace(/\s+/g, ' ').trim()
  if (!name) return null
  return name.slice(0, SPACE_NAME_MAX)
}

/** Spaces that aren't archived, in their chosen order. */
export function activeSpaces(spaces: Space[]): Space[] {
  return spaces.filter((s) => !s.archived).sort(bySpaceOrder)
}

export function bySpaceOrder(a: Space, b: Space): number {
  return a.position - b.position || a.createdAt.localeCompare(b.createdAt)
}

/** Position for a new Space: after all the others. */
export function nextSpacePosition(spaces: Space[]): number {
  return spaces.reduce((max, s) => Math.max(max, s.position), -1) + 1
}

/** The first colour no active Space uses yet (cycles once all are taken). */
export function nextSpaceColor(spaces: Space[]): SpaceColor {
  const used = new Set(activeSpaces(spaces).map((s) => s.color))
  return (SPACE_COLORS.find((c) => !used.has(c.key)) ?? SPACE_COLORS[spaces.length % SPACE_COLORS.length]).key
}

/**
 * The rule: a Move inside an Arc uses the Arc's Space (even none);
 * otherwise it keeps its own. The database enforces the same rule.
 */
export function effectiveSpaceId(
  move: { arcId?: string | null; spaceId?: string | null },
  arcs: Pick<Arc, 'id' | 'spaceId'>[],
): string | null {
  if (move.arcId) {
    const arc = arcs.find((a) => a.id === move.arcId)
    if (arc) return arc.spaceId ?? null
  }
  return move.spaceId ?? null
}

/** "Fly Ziyara" → "flyziyara", for matching #tags. */
function tagKey(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
}

/** Active Spaces whose name matches a #tag query (prefix first, then contains). */
export function matchSpaces(spaces: Space[], query: string): Space[] {
  const q = tagKey(query)
  const list = activeSpaces(spaces)
  if (!q) return list
  const prefix = list.filter((s) => tagKey(s.name).startsWith(q))
  const contains = list.filter((s) => !prefix.includes(s) && tagKey(s.name).includes(q))
  return [...prefix, ...contains]
}

/** The #tag being typed at the end of the title, e.g. "Call #fly" → { query: "fly", start: 5 }. */
export function typingSpaceTag(title: string): { query: string; start: number } | null {
  const m = /(?:^|\s)#([^\s#]*)$/.exec(title)
  if (!m) return null
  return { query: m[1], start: title.length - m[1].length - 1 }
}

/** Removes the #tag starting at `start` and tidies the spacing. */
export function removeSpaceTag(title: string, start: number): string {
  const end = title.slice(start).search(/\s|$/)
  return (title.slice(0, start) + title.slice(start + end)).replace(/\s+/g, ' ').trim()
}

/**
 * Swaps the #tag starting at `start` for the Space's name as plain text, so
 * "Add haptics to #mom" reads "Add haptics to Momentum" (the word stays typed).
 */
export function replaceSpaceTag(title: string, start: number, name: string): string {
  const end = title.slice(start).search(/\s|$/)
  return (title.slice(0, start) + name + title.slice(start + end)).replace(/\s+/g, ' ').trim()
}

/** How a Space is written as a tag in a title: "Fly Ziyara" → "#FlyZiyara". */
export function spaceTagText(name: string): string {
  return `#${name.replace(/\s+/g, '')}`
}

/** A title cut into plain text and #tags that name a Space (for drawing tag pills). */
export type TitlePart = { text: string; space?: Space }

/**
 * Splits a title into plain text and #tags. A #tag that names a Space exactly
 * (any case, spaces ignored) becomes its own part; archived Spaces still match
 * so older Moves keep their pill.
 */
export function splitSpaceTags(title: string, spaces: Space[]): TitlePart[] {
  const parts: TitlePart[] = []
  const re = /(^|\s)(#[^\s#]+)/g
  let last = 0
  for (let m = re.exec(title); m; m = re.exec(title)) {
    const space = spaces.find((s) => tagKey(s.name) === tagKey(m![2]))
    if (!space) continue
    const start = m.index + m[1].length
    if (start > last) parts.push({ text: title.slice(last, start) })
    parts.push({ text: m[2], space })
    last = start + m[2].length
  }
  if (last < title.length) parts.push({ text: title.slice(last) })
  return parts
}

/**
 * Finds a #tag anywhere in the title that names exactly one Space (or one
 * clear best prefix match), and returns that Space with the tag written out
 * in full ("#mom" → "#Momentum"), so it shows as a tag pill. Tags that don't
 * match stay as typed.
 */
export function extractSpaceTag(title: string, spaces: Space[]): { spaceId: string; title: string } | null {
  const re = /(?:^|\s)#([^\s#]+)/g
  let found: { spaceId: string; title: string } | null = null
  for (let m = re.exec(title); m; m = re.exec(title)) {
    const matches = matchSpaces(spaces, m[1])
    const exact = matches.find((s) => tagKey(s.name) === tagKey(m![1]))
    const space = exact ?? (matches.length === 1 ? matches[0] : undefined)
    if (!space) continue
    const start = m.index + m[0].indexOf('#')
    found = { spaceId: space.id, title: replaceSpaceTag(title, start, spaceTagText(space.name)) }
  }
  return found
}
