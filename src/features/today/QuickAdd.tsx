import { useState, type Ref } from 'react'
import { Plus } from 'lucide-react'
import { labels } from '../../config/labels.ts'
import { MOVE_TITLE_MAX } from '../moves/moveRules.ts'

/**
 * Inline "add a Move" row at the end of today's list.
 * Enter saves; the input keeps focus so you can type the next one straight away.
 */
export function QuickAdd({ onAdd, inputRef }: { onAdd: (title: string) => unknown; inputRef?: Ref<HTMLInputElement> }) {
  const [value, setValue] = useState('')
  const hasText = value.trim().length > 0

  return (
    <form
      className="flex items-center gap-3.5"
      onSubmit={(e) => {
        e.preventDefault()
        if (!hasText) return
        onAdd(value)
        setValue('')
      }}
    >
      <span
        aria-hidden
        className={[
          'grid size-[22px] shrink-0 place-items-center rounded-full transition-colors duration-150',
          hasText ? 'bg-primary text-on-primary' : 'text-ink-3',
        ].join(' ')}
      >
        <Plus size={hasText ? 15 : 20} strokeWidth={hasText ? 2.4 : 1.6} />
      </span>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setValue('')
            e.currentTarget.blur()
          }
        }}
        maxLength={MOVE_TITLE_MAX}
        enterKeyHint="enter"
        autoComplete="off"
        aria-label={`Add a ${labels.move.singular}`}
        placeholder={`Add a ${labels.move.singular}`}
        className="min-w-0 flex-1 bg-transparent py-3 text-[16px] leading-[24px] text-ink outline-none placeholder:text-ink-3"
      />
    </form>
  )
}
