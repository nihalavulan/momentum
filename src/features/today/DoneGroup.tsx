import { useId, useState, type ReactNode } from 'react'
import { ChevronDownIcon } from '../../components/ui/icons.tsx'
import { MoveList } from '../moves/components/MoveRow.tsx'

/** Completed Moves, folded away by default so the list stays about what's left. */
export function DoneGroup({ count, children }: { count: number; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const listId = useId()

  return (
    <section className="mt-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={listId}
        className="-mx-2 flex h-9 items-center gap-1.5 rounded-full px-3 text-[14px] font-semibold text-ink outline-none hover:bg-surface focus-visible:bg-surface"
      >
        {open ? 'Hide done' : `Show ${count} done`}
        <ChevronDownIcon
          size={16}
          strokeWidth={2.2}
          className={`text-ink-2 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div id={listId} className="fade-enter mt-2">
          <MoveList>{children}</MoveList>
        </div>
      )}
    </section>
  )
}
