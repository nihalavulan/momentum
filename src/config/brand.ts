/**
 * Brand config — the ONLY place the app name and brand colours are defined.
 *
 * Everything else reads from here:
 *   - CSS variables (--color-primary, ...) injected into index.html at build
 *   - Tailwind theme (bg-primary, text-primary, bg-primary-soft, ...)
 *   - <title>, theme-color meta, PWA manifest and generated icons
 *
 * Never hardcode the app name or a brand hex value anywhere else.
 * Developer-only; not a user setting.
 */
export const brand = {
  appName: 'Momentum',
  shortName: 'Momentum',
  tagline: 'Plan your day. Keep your momentum.',
  colors: {
    primary: '#FF5A1F',
    primaryHover: '#E64A12',
    primarySoft: '#FFEDE5',
    /** Text/icon colour shown on top of `primary`. */
    onPrimary: '#FFFFFF',
  },
} as const

export type Brand = typeof brand
