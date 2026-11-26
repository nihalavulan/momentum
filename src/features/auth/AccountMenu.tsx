import { useEffect, useId, useRef, useState } from 'react'
import { useAuth } from './authContext.ts'

/** Ask the app shell to show the intro again (listened to in App). */
export const SHOW_INTRO_EVENT = 'momentum:show-intro'

/**
 * Avatar button (first letter of the email) with a small menu: who's signed in,
 * show the intro again, sign out. `variant="row"` is the desktop sidebar version.
 */
export function AccountMenu({ variant = 'avatar' }: { variant?: 'avatar' | 'row' }) {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!user) return null
  const initial = user.email.charAt(0).toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Account"
        className={
          variant === 'row'
            ? 'flex h-12 w-full items-center gap-3 rounded-xl px-2 text-left outline-none hover:bg-surface focus-visible:ring-2 focus-visible:ring-primary/30'
            : 'grid size-9 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2'
        }
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-[15px] font-semibold text-white">
          {initial}
        </span>
        {variant === 'row' && <span className="min-w-0 truncate text-[14px] font-medium text-ink">{user.email}</span>}
      </button>

      {open && (
        <div
          id={menuId}
          className={[
            'fade-enter absolute z-40 w-64 rounded-2xl border border-line bg-white p-2 shadow-[0_12px_36px_rgba(0,0,0,0.12)]',
            variant === 'row' ? 'bottom-full left-0 mb-2' : 'top-full right-0 mt-2',
          ].join(' ')}
        >
          <p className="truncate px-3 pt-2 pb-3 text-[13px] text-ink-2">
            Signed in as <span className="font-semibold text-ink">{user.email}</span>
          </p>
          <MenuItem
            onClick={() => {
              setOpen(false)
              window.dispatchEvent(new Event(SHOW_INTRO_EVENT))
            }}
          >
            Show intro
          </MenuItem>
          <MenuItem
            onClick={() => {
              setOpen(false)
              void signOut()
            }}
          >
            Sign out
          </MenuItem>
        </div>
      )}
    </div>
  )
}

function MenuItem({ onClick, children }: { onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 w-full items-center rounded-xl px-3 text-left text-[15px] text-ink outline-none hover:bg-surface focus-visible:bg-surface"
    >
      {children}
    </button>
  )
}
