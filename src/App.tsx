import { useCallback, useEffect, useState } from 'react'
import { ComingSoonView } from './components/layout/ComingSoonView.tsx'
import { Sidebar } from './components/layout/Sidebar.tsx'
import { TabBar } from './components/layout/TabBar.tsx'
import { TABS, useActiveTab } from './components/layout/tabs.ts'
import { SHOW_INTRO_EVENT } from './features/auth/AccountMenu.tsx'
import { AuthProvider } from './features/auth/AuthProvider.tsx'
import { useAuth } from './features/auth/authContext.ts'
import { SignInScreen } from './features/auth/SignInScreen.tsx'
import { MovesProvider } from './features/moves/MovesProvider.tsx'
import { MovesView } from './features/moves/MovesView.tsx'
import { IntroCards } from './features/onboarding/IntroCards.tsx'
import { TodayView } from './features/today/TodayView.tsx'
import { SpacesProvider } from './features/spaces/SpacesProvider.tsx'
import { SpacesSheet } from './features/spaces/components/SpacesSheet.tsx'
import { OPEN_SPACES_EVENT } from './features/spaces/spacesContext.ts'
import { useThemePref } from './lib/theme.ts'

export default function App() {
  // Applies the saved theme and follows the device setting on "System".
  useThemePref()
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}

/** Sign-in screen until someone is signed in; then their own data and the app. */
function Gate() {
  const { ready, user } = useAuth()
  if (!ready) return null // reading the saved session takes a moment
  if (!user) return <SignInScreen />
  return (
    <SpacesProvider key={user.id} userKey={user.id}>
      <MovesProvider key={user.id} userKey={user.id}>
        <Shell />
      </MovesProvider>
    </SpacesProvider>
  )
}

/**
 * App shell.
 * Mobile: one column with the bottom bar. Desktop (≥1024px): fixed sidebar
 * and a wide content area (with a side rail at ≥1280px inside Today).
 * The intro shows once per account, and again from the account menu.
 */
function Shell() {
  const { user, markIntroSeen } = useAuth()
  const { tab, selectTab, resetKey } = useActiveTab()
  const current = TABS.find((t) => t.id === tab) ?? TABS[0]
  const [introRequested, setIntroRequested] = useState(false)
  const showIntro = introRequested || !user?.introSeenAt
  const [spacesOpen, setSpacesOpen] = useState(false)
  const closeSpaces = useCallback(() => setSpacesOpen(false), [])

  useEffect(() => {
    const onOpen = () => setSpacesOpen(true)
    window.addEventListener(OPEN_SPACES_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_SPACES_EVENT, onOpen)
  }, [])

  useEffect(() => {
    const onShow = () => setIntroRequested(true)
    window.addEventListener(SHOW_INTRO_EVENT, onShow)
    return () => window.removeEventListener(SHOW_INTRO_EVENT, onShow)
  }, [])

  return (
    <>
      <Sidebar active={tab} onSelect={selectTab} />
      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-xl px-5 pb-40 lg:max-w-[1160px] lg:px-14 lg:pb-24">
          {tab === 'today' ? (
            <TodayView key={resetKey} />
          ) : tab === 'moves' ? (
            <MovesView />
          ) : (
            <ComingSoonView title={current.label} icon={current.icon} />
          )}
        </main>
      </div>
      <TabBar active={tab} onSelect={selectTab} />
      {spacesOpen && <SpacesSheet onClose={closeSpaces} />}
      {showIntro && (
        <IntroCards
          onDone={() => {
            setIntroRequested(false)
            if (!user?.introSeenAt) markIntroSeen()
          }}
        />
      )}
    </>
  )
}
