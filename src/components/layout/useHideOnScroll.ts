import { useEffect, useState } from 'react'

/**
 * True while the user scrolls down (past a small threshold), false as soon as
 * they scroll up or reach the top. Used to tuck the mobile bottom bar away.
 */
export function useHideOnScroll(threshold = 80) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let last = window.scrollY
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const y = window.scrollY
        const delta = y - last
        if (y < threshold) setHidden(false)
        else if (delta > 6) setHidden(true)
        else if (delta < -6) setHidden(false)
        last = y
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [threshold])

  return hidden
}
