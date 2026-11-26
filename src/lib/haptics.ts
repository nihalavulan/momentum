/**
 * Haptic feedback for taps. Call it straight from the tap handler (not after a
 * timeout or await), because browsers only allow it during a user gesture.
 *
 * - Android / Chrome: the Vibration API, with a short pattern per kind.
 * - iPhone (Safari 18+, and the installed PWA): no Vibration API, but toggling
 *   a native `<input type="checkbox" switch>` plays the system tick, so we
 *   click a hidden one.
 * - Desktop and anything else: does nothing.
 */
export type HapticKind =
  /** A plain tap: adding, opening, choosing an option. */
  | 'light'
  /** Moving between choices: tabs, days. */
  | 'selection'
  /** Something finished: completing a Move. */
  | 'success'
  /** Undo, or a destructive step. */
  | 'warning'

const VIBRATE: Record<HapticKind, number | number[]> = {
  light: 10,
  selection: 6,
  success: [12, 60, 18],
  warning: [20, 40, 20],
}

/** iOS can only play one tick per toggle; doubles give `success` a fuller feel. */
const IOS_TICKS: Record<HapticKind, number> = {
  light: 1,
  selection: 1,
  success: 2,
  warning: 2,
}

let iosSwitch: HTMLLabelElement | null = null

function canVibrate() {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
}

function isIOS() {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

function iosTick() {
  if (!iosSwitch) {
    const label = document.createElement('label')
    label.setAttribute('aria-hidden', 'true')
    label.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden;left:-9999px'
    const input = document.createElement('input')
    input.type = 'checkbox'
    input.setAttribute('switch', '')
    input.tabIndex = -1
    label.appendChild(input)
    document.body.appendChild(label)
    iosSwitch = label
  }
  iosSwitch.click()
}

export function haptic(kind: HapticKind = 'light') {
  try {
    if (canVibrate()) {
      navigator.vibrate(VIBRATE[kind])
    } else if (isIOS()) {
      iosTick()
      for (let i = 1; i < IOS_TICKS[kind]; i++) window.setTimeout(iosTick, 70 * i)
    }
  } catch {
    // Haptics are a nicety; never let them break a tap.
  }
}
