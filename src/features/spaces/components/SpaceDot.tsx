import { spaceDot } from '../../../config/spaceColors.ts'

/** The small muted colour dot that stands for a Space. */
export function SpaceDot({ color, size = 8, className = '' }: { color: string; size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 rounded-full ${className}`}
      style={{ width: size, height: size, backgroundColor: spaceDot(color) }}
    />
  )
}
