import { useEffect, useState, type ReactNode } from 'react'
import { brand } from '../../config/brand.ts'
import { labels } from '../../config/labels.ts'
import { BrandSymbol } from '../../components/ui/BrandSymbol.tsx'
import { CalendarIcon, StreaksIcon, SparksIcon } from '../../components/ui/icons.tsx'

interface Card {
  title: string
  body: string
  art: ReactNode
}

const CARDS: Card[] = [
  {
    title: `${labels.today.singular} is your plan`,
    body: `Each task is a ${labels.move.singular}. Tap the circle when it's done. It folds away and your day's ring fills up.`,
    art: <CheckArt />,
  },
  {
    title: 'Watch your week fill up',
    body: 'Every day in the week strip has a ring. Tap any day to see or plan what’s on it.',
    art: <RingsArt />,
  },
  {
    title: 'Any day, or no day',
    body: `Pick a day with the chips or the calendar, or just type it: “Call supplier fri”, “Invoice 12 dec”. ${labels.move.plural} with no date wait in the ${labels.move.plural} tab.`,
    art: <IconArt><CalendarIcon size={44} strokeWidth={1.7} /></IconArt>,
  },
  {
    title: `${labels.arc.plural}, ${labels.streak.plural} and ${labels.spark.plural}`,
    body: `${labels.arc.plural} group ${labels.move.plural} toward a goal with a deadline. ${labels.streak.plural} (habits) and ${labels.spark.plural} (quick ideas) are coming soon.`,
    art: (
      <div className="flex items-center gap-4 text-primary">
        <IconArt><BrandSymbol size={40} /></IconArt>
        <IconArt><StreaksIcon size={36} strokeWidth={1.8} /></IconArt>
        <IconArt><SparksIcon size={36} strokeWidth={1.8} /></IconArt>
      </div>
    ),
  },
]

/**
 * First-run intro: four short cards, Skip always visible. Full screen on
 * mobile, a centred card on desktop. Arrow keys move between cards.
 */
export function IntroCards({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0)
  const card = CARDS[index]
  const isLast = index === CARDS.length - 1

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDone()
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, CARDS.length - 1))
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDone])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Welcome to ${brand.appName}`}
      className="fade-enter fixed inset-0 z-50 flex bg-white lg:items-center lg:justify-center lg:bg-black/30"
    >
      <div className="flex w-full flex-col px-6 pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+24px)] lg:h-auto lg:max-w-[460px] lg:rounded-[28px] lg:bg-white lg:p-8 lg:shadow-[0_24px_64px_rgba(0,0,0,0.2)]">
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-medium text-ink-2 tabular-nums">
            {index + 1} of {CARDS.length}
          </span>
          <button
            type="button"
            onClick={onDone}
            className="h-9 rounded-full px-3 text-[15px] font-semibold text-ink outline-none hover:bg-surface focus-visible:bg-surface"
          >
            Skip
          </button>
        </div>

        <div key={index} className="sheet-enter flex flex-1 flex-col justify-center py-10 lg:py-12">
          <div className="mb-10 flex h-40 items-center justify-center rounded-[28px] bg-primary-soft">{card.art}</div>
          <h2 className="text-[28px] leading-tight font-bold tracking-[-0.03em] text-ink">{card.title}</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-ink-2">{card.body}</p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-1.5" aria-hidden>
            {CARDS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-200 ${i === index ? 'w-6 bg-ink' : 'w-1.5 bg-line'}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {index > 0 && (
              <button
                type="button"
                onClick={() => setIndex((i) => i - 1)}
                className="h-12 rounded-full px-5 text-[15px] font-semibold text-ink outline-none hover:bg-surface focus-visible:bg-surface"
              >
                Back
              </button>
            )}
            <button
              type="button"
              autoFocus
              onClick={() => (isLast ? onDone() : setIndex((i) => i + 1))}
              className="h-12 rounded-full bg-primary px-6 text-[15px] font-semibold text-on-primary outline-none transition-colors duration-150 hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
            >
              {isLast ? 'Get started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function IconArt({ children }: { children: ReactNode }) {
  return <div className="grid size-20 place-items-center rounded-full bg-white text-primary">{children}</div>
}

/** A Move being completed: filled check circle next to a struck title line. */
function CheckArt() {
  return (
    <div className="flex w-56 flex-col gap-3">
      {[true, false].map((done, i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
          <span className={`grid size-6 place-items-center rounded-full ${done ? 'bg-primary' : 'border-[1.6px] border-ink-3'}`}>
            {done && (
              <svg viewBox="0 0 16 16" className="size-3.5 text-on-primary" aria-hidden>
                <path d="M3.5 8.5 L6.5 11.5 L12.5 4.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <span className={`h-2 flex-1 rounded-full ${done ? 'bg-ink-3/50' : 'bg-ink/80'}`} />
        </div>
      ))}
    </div>
  )
}

/** Three days of the week strip, rings at different fill levels. */
function RingsArt() {
  const C = 2 * Math.PI * 19
  return (
    <div className="flex gap-4">
      {[1, 0.6, 0.2].map((ratio, i) => (
        <svg key={i} viewBox="0 0 44 44" className="size-14 -rotate-90 rounded-full bg-white" aria-hidden>
          <circle cx="22" cy="22" r="19" fill="none" stroke="var(--color-line)" strokeWidth="3" />
          <circle
            cx="22"
            cy="22"
            r="19"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - ratio)}
          />
        </svg>
      ))}
    </div>
  )
}
