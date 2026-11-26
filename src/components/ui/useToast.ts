import { useCallback, useEffect, useRef, useState } from 'react'

export interface ToastState {
  id: number
  message: string
  undo?: () => void
}

/** One toast at a time; a new one replaces the old. Auto-hides after 4s. */
export function useToast(duration = 4000) {
  const [toast, setToast] = useState<ToastState | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const dismiss = useCallback(() => {
    window.clearTimeout(timer.current)
    setToast(null)
  }, [])

  const show = useCallback(
    (message: string, undo?: () => void) => {
      window.clearTimeout(timer.current)
      setToast({ id: Date.now(), message, undo })
      timer.current = window.setTimeout(() => setToast(null), duration)
    },
    [duration],
  )

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return { toast, show, dismiss }
}
