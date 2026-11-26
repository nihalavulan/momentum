/** Sign-in rules shared by the sign-in screen (and later the MCP server). Pure functions. */

/** Length of the personal access code (used as the Supabase password for now). */
export const CODE_LENGTH = 6

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase()
}

export function isValidEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizeEmail(raw))
}

export function isValidCode(raw: string): boolean {
  return new RegExp(`^\\d{${CODE_LENGTH}}$`).test(raw)
}
