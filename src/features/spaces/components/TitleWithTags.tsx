import { spaceDot, spaceTint } from '../../../config/spaceColors.ts'
import { splitSpaceTags } from '../spaceRules.ts'
import type { Space } from '../types.ts'

/**
 * A Move title with its #Space tags drawn as small pills in the Space's colour.
 *
 * `fit="exact"` is for drawing behind a text field: the pill adds no width
 * (padding comes from a shadow instead), so it lines up with the typed text.
 */
export function TitleWithTags({
  title,
  spaces,
  fit = 'pill',
  muted = false,
}: {
  title: string
  spaces: Space[]
  fit?: 'pill' | 'exact'
  /** Done Moves: softer pill. */
  muted?: boolean
}) {
  const parts = splitSpaceTags(title, spaces)
  return (
    <>
      {parts.map((part, i) =>
        part.space ? (
          <span
            key={i}
            className={fit === 'exact' ? 'rounded-[5px]' : 'mx-px inline-block rounded-md px-1.5 text-[0.92em] leading-[1.35] font-medium'}
            style={{
              backgroundColor: spaceTint(part.space.color, muted ? 0.14 : 0.24),
              color: fit === 'exact' ? undefined : muted ? undefined : 'var(--color-ink)',
              boxShadow:
                fit === 'exact'
                  ? `0 0 0 2px ${spaceTint(part.space.color, 0.24)}`
                  : `inset 0 0 0 1px ${spaceTint(part.space.color, muted ? 0.2 : 0.35)}`,
              textDecorationColor: spaceDot(part.space.color),
            }}
          >
            {part.text}
          </span>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  )
}
