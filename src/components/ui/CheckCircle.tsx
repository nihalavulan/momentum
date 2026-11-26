/**
 * The round completion toggle. Unchecked: thin grey ring. Checked: primary fill
 * with a white check. `animate` plays the pop + draw (only right after a tap).
 */
export function CheckCircle({
  checked,
  animate = false,
  label,
  onToggle,
}: {
  checked: boolean
  animate?: boolean
  label: string
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      aria-label={label}
      // 44px hit area around a 24px circle
      className="-m-[10px] grid size-11 shrink-0 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <span
        className={[
          'grid size-6 place-items-center rounded-full transition-colors duration-150',
          checked ? 'bg-primary' : 'border-[1.6px] border-ink-3 hover:border-ink-2',
          checked && animate ? 'check-pop' : '',
        ].join(' ')}
      >
        {checked && (
          <svg viewBox="0 0 16 16" className="size-3.5 text-on-primary" aria-hidden>
            <path
              d="M3.5 8.5 L6.5 11.5 L12.5 4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={animate ? 'check-draw' : ''}
            />
          </svg>
        )}
      </span>
    </button>
  )
}
