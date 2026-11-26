import type { Icon } from '../ui/icons.tsx'

/** Placeholder for sections that aren't built yet. */
export function ComingSoonView({ title, icon: Icon }: { title: string; icon: Icon }) {
  return (
    <div className="pt-6 lg:pt-12">
      <h1 className="text-[32px] leading-tight font-bold tracking-[-0.025em] text-ink lg:text-[40px]">{title}</h1>
      <div className="mt-24 flex flex-col items-center text-center lg:mt-32">
        <div className="mb-5 grid size-16 place-items-center rounded-full bg-surface text-ink-2">
          <Icon size={28} strokeWidth={1.7} />
        </div>
        <p className="text-[18px] font-semibold text-ink">Coming soon</p>
        <p className="mt-1 max-w-[18rem] text-[15px] text-ink-2">This section isn't built yet.</p>
      </div>
    </div>
  )
}
