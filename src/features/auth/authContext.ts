import { createContext, useContext } from 'react'

export interface SignedInUser {
  id: string
  email: string
  /** Set once the person has finished or skipped the intro (stored on their account). */
  introSeenAt: string | null
}

export type SignInResult = { ok: true } | { ok: false; message: string }

export interface AuthStore {
  /** False until the saved session has been read (a moment on start-up). */
  ready: boolean
  user: SignedInUser | null
  signIn: (email: string, code: string) => Promise<SignInResult>
  signOut: () => Promise<void>
  markIntroSeen: () => void
}

export const AuthContext = createContext<AuthStore | null>(null)

export function useAuth(): AuthStore {
  const store = useContext(AuthContext)
  if (!store) throw new Error('useAuth must be used inside <AuthProvider>')
  return store
}
