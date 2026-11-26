import { useId, useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

/** Collapsible "Done" group at the bottom of Today. Open by default. */
export function DoneGroup({ count, children }: { count: number; children: ReactNode }) {
  const [open, setOpen] = useState(true)
  const listId = useId()

  return (
    <section className="mt-8">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={listId}
        className="-mx-2 flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] font-semibold text-ink-2 outline-none hover:text-ink focus-visible:bg-surface"
      >
        Done
        <span className="font-normal text-ink-3">{count}</span>
        <ChevronDown
          size={15}
          strokeWidth={2}
          aria-hidden
          className={`text-ink-3 transition-transform duration-150 ${open ? '' : '-rotate-90'}`}
        />
      </button>
      {open && (
        <ul id={listId} className="mt-1">
          {children}
        </ul>
      )}
    </section>
  )
}
