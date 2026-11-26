# Momentum (working name)

Fast, mobile-first personal planner: **Moves**, **Today**, **Arcs**, **Streaks**, **Sparks**.

React + Vite + TypeScript · Tailwind v4 · Supabase · PowerSync (planned) · PWA · Vercel

## Run

```bash
npm install
cp .env.example .env.local   # fill in Supabase keys
npm run dev
```

## Where things live

| What | File |
|------|------|
| App name, tagline, brand colours (single source of truth) | `src/config/brand.ts` |
| Feature labels (Moves, Today, Arcs, Streaks, Sparks) | `src/config/labels.ts` |
| Placeholder app icon (generated from brand colours) | `src/config/brandIcon.ts` |
| Tailwind semantic colour tokens (`bg-primary`, …) | `src/index.css` |
| Injects `<title>`, CSS vars, manifest, icons from brand config | `vite.config.ts` |
| Supabase client | `src/lib/supabase.ts` |
| Date helpers (`YYYY-MM-DD` local days) | `src/lib/dates.ts` |
| Moves: types, rules, data provider (`useMoves`) | `src/features/moves/` |
| Today view | `src/features/today/` |
| Shared UI (check circle, progress bar, symbol) | `src/components/ui/` |
| App chrome (tab bar, tabs, page header) | `src/components/layout/` |
| Neutral colour tokens (`ink`, `line`, `surface`…) | `src/index.css` |

Never hardcode the app name or a brand hex value anywhere else — use `brand.*`,
`labels.*`, or the Tailwind tokens (`bg-primary`, `text-primary`,
`bg-primary-hover`, `bg-primary-soft`, `text-on-primary`).
