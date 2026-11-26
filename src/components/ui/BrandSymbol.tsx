import { BRAND_SYMBOL_PATH } from '../../config/brandIcon.ts'
import { brand } from '../../config/brand.ts'

/** The Rising M. Inherits colour from `currentColor` (e.g. text-ink-3, text-primary). */
export function BrandSymbol({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="30 30 196 196"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={brand.appName}
    >
      <path
        d={BRAND_SYMBOL_PATH}
        fill="none"
        stroke="currentColor"
        strokeWidth={40}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
