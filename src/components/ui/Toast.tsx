import type { ToastState } from './useToast.ts'

/**
 * Bottom toast with an optional Undo. Sits above the mobile bottom bar
 * (leaving room for the add button) and centred in the content on desktop.
 */
export function Toast({ toast, onDismiss }: { toast: ToastState | null; onDismiss: () => void }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+84px)] z-30 flex justify-start pr-[72px] lg:inset-x-0 lg:bottom-8 lg:justify-center lg:pr-0 lg:pl-64"
    >
      {toast && (
        <div
          key={toast.id}
          className="toast-enter pointer-events-auto flex min-h-12 max-w-full items-center gap-4 rounded-2xl bg-ink py-2 pr-2 pl-4 text-[14px] text-white shadow-[0_8px_28px_rgba(0,0,0,0.2)]"
        >
          <span className="min-w-0 truncate">{toast.message}</span>
          {toast.undo && (
            <button
              type="button"
              onClick={() => {
                toast.undo?.()
                onDismiss()
              }}
              className="h-8 shrink-0 rounded-xl px-3 font-semibold text-white outline-none hover:bg-white/10 focus-visible:bg-white/15"
            >
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  )
}
