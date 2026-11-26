import type { LucideIcon } from 'lucide-react'
import { PageHeader } from './PageHeader.tsx'

/** Placeholder for sections that aren't built yet. */
export function ComingSoonView({ title, icon: Icon }: { title: string; icon: LucideIcon }) {
  return (
    <>
      <PageHeader title={title} />
      <div className="flex flex-col items-center pt-24 text-center">
        <div className="mb-4 grid size-14 place-items-center rounded-full bg-surface text-ink-2">
          <Icon size={26} strokeWidth={1.6} aria-hidden />
        </div>
        <p className="text-[17px] font-semibold text-ink">Coming soon</p>
        <p className="mt-1 max-w-[16rem] text-[15px] text-ink-2">This section isn't built yet.</p>
      </div>
    </>
  )
}
