import { useEffect } from 'react'
import { labels } from '../../../config/labels.ts'
import { SpacesManager } from './SpacesManager.tsx'

/**
 * The Spaces manager as a sheet: rises from the bottom on mobile, a centred
 * card on desktop. Opened from the account menu (mobile) or the sidebar.
 */
export function SpacesSheet({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Escape inside a name field only cancels that edit.
      if (e.key === 'Escape' && !(e.target instanceof HTMLInputElement)) onClose()
    }
    window.addEventListener('keydown', onKey)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={labels.space.plural}
      className="fixed inset-0 z-40 flex items-end justify-center lg:items-center"
    >
      <button type="button" aria-label="Close" onClick={onClose} className="fade-enter absolute inset-0 bg-black/30" />
      <div className="reschedule-enter relative flex max-h-[85dvh] w-full max-w-[440px] flex-col rounded-t-[28px] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.16)] lg:rounded-[28px] lg:shadow-[0_16px_48px_rgba(0,0,0,0.18)]">
        <div className="shrink-0 px-5 pt-3">
          <span aria-hidden className="mx-auto mb-3 block h-1 w-9 rounded-full bg-line lg:hidden" />
          <div className="flex items-center justify-between gap-3 pb-3">
            <p className="text-[17px] font-semibold text-ink">{labels.space.plural}</p>
            <button
              type="button"
              onClick={onClose}
              className="-mr-2 h-9 shrink-0 rounded-full px-3 text-[15px] font-semibold text-ink outline-none hover:bg-surface focus-visible:bg-surface"
            >
              Done
            </button>
          </div>
        </div>
        <div className="overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom)+20px)] lg:pb-5">
          <SpacesManager />
        </div>
      </div>
    </div>
  )
}
