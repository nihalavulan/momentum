import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.warn('Supabase env vars missing — copy .env.example to .env.local and fill them in.')
}

/**
 * Supabase client (auth + remote Postgres).
 * UI reads/writes will go through the local PowerSync DB once it's set up —
 * this client is for auth and server-side sync, not for blocking UI calls.
 */
export const supabase = createClient(url ?? 'http://localhost', anonKey ?? 'missing-key', {
  auth: { persistSession: true, autoRefreshToken: true },
})
