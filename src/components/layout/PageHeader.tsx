import type { ReactNode } from 'react'

/** iOS-style large title, with an optional line above it (e.g. the date). */
export function PageHeader({ title, eyebrow }: { title: string; eyebrow?: ReactNode }) {
  return (
    <header className="pt-4 pb-5">
      {eyebrow && <div className="mb-1 flex items-center gap-2 text-[15px] text-ink-2">{eyebrow}</div>}
      <h1 className="text-[34px] leading-[1.1] font-bold tracking-[-0.022em] text-ink">{title}</h1>
    </header>
  )
}
