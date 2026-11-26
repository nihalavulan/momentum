import { brand } from './brand.ts'

/**
 * The Momentum symbol ("Rising M"): an M whose right peak climbs higher, with a
 * checkmark hidden in the valley-to-peak stroke. Master artwork and usage rules
 * live in design/logo/ (see BRAND-GUIDE.md).
 *
 * Path is drawn on a 256×256 canvas; angles are exactly 45° and 60°.
 */
export const BRAND_SYMBOL_PATH = 'M59 200 V116 L123 180 L197 52 V200'

/**
 * App icon: white symbol on a full-bleed primary tile (the OS rounds the corners).
 * Used as the source for the favicon, Apple touch icon and PWA manifest icons.
 * Colours always come from `brand`.
 */
export function brandIconSvg(): string {
  const { primary, onPrimary } = brand.colors
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <rect width="256" height="256" fill="${primary}"/>
  <path transform="translate(128 124) scale(0.77) translate(-128 -126)" d="${BRAND_SYMBOL_PATH}" fill="none" stroke="${onPrimary}" stroke-width="37" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
}
