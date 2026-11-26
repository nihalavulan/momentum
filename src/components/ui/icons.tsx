/**
 * Momentum's icon set: deliberately minimal, one or two strokes each, drawn on
 * a 24px grid with round caps (the same construction as the Rising M).
 * Colour comes from `currentColor`.
 */
import type { ReactNode } from 'react'

export interface IconProps {
  size?: number
  strokeWidth?: number
  className?: string
}

export type Icon = (props: IconProps) => ReactNode

function Svg({ size = 24, strokeWidth = 1.8, className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {children}
    </svg>
  )
}

/** Today: a ring with the day at its centre. */
export const TodayIcon: Icon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none" />
  </Svg>
)

/** Moves: a single check. */
export const MovesIcon: Icon = (p) => (
  <Svg {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
)

/** Arcs: an arc in progress, with the next Move ahead of it. */
export const ArcsIcon: Icon = (p) => (
  <Svg {...p}>
    <path d="M3.5 16.5A8.5 8.5 0 0 1 16.9 9.54" />
    <circle cx="20.1" cy="13.9" r="1.8" fill="currentColor" stroke="none" />
  </Svg>
)

/** Streaks: one flame. */
export const StreaksIcon: Icon = (p) => (
  <Svg {...p}>
    <path d="M12 3.5c.6 3.2 5 5.4 5 10a5 5 0 0 1-10 0c0-1.9.9-3.4 2.3-4.4.2 1.5.9 2.4 2 2.9.4-3-.4-5.6.7-8.5z" />
  </Svg>
)

/** Sparks: a four-point spark. */
export const SparksIcon: Icon = (p) => (
  <Svg {...p}>
    <path d="M12 4l1.8 6.2L20 12l-6.2 1.8L12 20l-1.8-6.2L4 12l6.2-1.8z" />
  </Svg>
)

export const PlusIcon: Icon = (p) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
)

export const ChevronLeftIcon: Icon = (p) => (
  <Svg {...p}>
    <path d="M14.5 6l-6 6 6 6" />
  </Svg>
)

export const ChevronRightIcon: Icon = (p) => (
  <Svg {...p}>
    <path d="M9.5 6l6 6-6 6" />
  </Svg>
)

export const ChevronDownIcon: Icon = (p) => (
  <Svg {...p}>
    <path d="M6 9.5l6 6 6-6" />
  </Svg>
)

/** Push forward (to tomorrow / to today). */
export const ArrowRightIcon: Icon = (p) => (
  <Svg {...p}>
    <path d="M5 12h13M13 6.5l5.5 5.5-5.5 5.5" />
  </Svg>
)

export const CloseIcon: Icon = (p) => (
  <Svg {...p}>
    <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
  </Svg>
)
