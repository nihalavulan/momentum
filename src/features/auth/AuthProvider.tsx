import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase.ts'
import { normalizeEmail } from './authRules.ts'
import { AuthContext, type AuthStore, type SignInResult, type SignedInUser } from './authContext.ts'

/**
 * Supabase sign-in with email + personal 6-digit access code (the code is the
 * account password for now; public sign-ups are switched off, so only people
 * the owner adds can get in). Later: swap `signIn` for emailed codes / Google
 * and keep the `AuthStore` shape.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  // Lets the intro close instantly, before the account update round-trips.
  const [introSeenLocally, setIntroSeenLocally] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setReady(true)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, code: string): Promise<SignInResult> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: normalizeEmail(email), password: code })
      if (!error) return { ok: true }
      if (error.status === 400 || /invalid/i.test(error.message)) {
        return { ok: false, message: "That code doesn't match this email. Check the code and try again." }
      }
      if (error.status === 429) return { ok: false, message: 'Too many tries. Wait a minute, then try again.' }
      return { ok: false, message: `Couldn't sign in: ${error.message}` }
    } catch {
      return { ok: false, message: "Couldn't reach the server. Check your connection and try again." }
    }
  }, [])

  const signOut = useCallback(async () => {
    setIntroSeenLocally(null)
    await supabase.auth.signOut()
  }, [])

  const markIntroSeen = useCallback(() => {
    const at = new Date().toISOString()
    setIntroSeenLocally(at)
    void supabase.auth.updateUser({ data: { intro_seen_at: at } })
  }, [])

  const user = useMemo<SignedInUser | null>(() => {
    const u = session?.user
    if (!u) return null
    const fromAccount = typeof u.user_metadata?.intro_seen_at === 'string' ? u.user_metadata.intro_seen_at : null
    return { id: u.id, email: u.email ?? '', introSeenAt: fromAccount ?? introSeenLocally }
  }, [session, introSeenLocally])

  const store = useMemo<AuthStore>(
    () => ({ ready, user, signIn, signOut, markIntroSeen }),
    [ready, user, signIn, signOut, markIntroSeen],
  )
  return <AuthContext.Provider value={store}>{children}</AuthContext.Provider>
}
