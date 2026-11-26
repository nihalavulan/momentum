import { useEffect, type ComponentProps } from 'react'
import { labels } from '../../config/labels.ts'
import { Composer } from './Composer.tsx'

/**
 * Mobile add sheet. It drops from the top rather than rising from the bottom,
 * so the iPhone keyboard never covers it. Stays open for adding several Moves.
 */
export function ComposerSheet({
  onClose,
  ...composer
}: { onClose: () => void } & Omit<ComponentProps<typeof Composer>, 'autoFocus' | 'alwaysShowOptions'>) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [onClose])

  return (
    <div role="dialog" aria-modal="true" aria-label={`New ${labels.move.singular}`} className="fixed inset-0 z-40 lg:hidden">
      <button type="button" aria-label="Close" onClick={onClose} className="fade-enter absolute inset-0 bg-black/30" />
      <div className="sheet-enter relative mx-3 mt-[calc(env(safe-area-inset-top)+12px)] rounded-[28px] bg-white p-2 shadow-[0_16px_48px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between px-3 pt-2 pb-3">
          <p className="text-[17px] font-semibold text-ink">New {labels.move.singular}</p>
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-full px-3 text-[15px] font-semibold text-ink outline-none hover:bg-surface focus-visible:bg-surface"
          >
            Done
          </button>
        </div>
        <Composer {...composer} autoFocus alwaysShowOptions />
      </div>
    </div>
  )
}
