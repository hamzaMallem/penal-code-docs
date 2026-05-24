# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # dev server (Next.js with Turbopack)
npm run build        # production build
npm run lint         # ESLint (flat config)
npm run type-check   # tsc --noEmit
```

No test runner configured. Run `lint` then `type-check` before considering changes done.

## Architecture

**Qanounak** — static-first Next.js PWA for browsing Moroccan penal laws in Arabic (RTL). No backend, no API routes. All law data lives in static JSON files imported at build time.

- **Framework**: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui (new-york style)
- **Font**: IBM Plex Sans Arabic (`--font-arabic`)
- **Theme**: Dark by default via `next-themes`; `suppressHydrationWarning` on `<body>`
- **Search**: Fuse.js client-side search over all law articles
- **PWA**: Service worker at `public/sw.js`, manifest, offline page at `/offline`

### Routes

| Route | Purpose |
|---|---|
| `/` | Home — law collections list |
| `/[lawKey]` | Law source landing (e.g. `/cpp`, `/dp`) |
| `/[lawKey]/[bookId]` | Book view with tree navigation |
| `/[lawKey]/[bookId]/[articleNumber]` | Individual article |

### Data model

- `lib/law-sources.ts` — `LAW_SOURCES` registry; add new laws here. Each source has `key`, `label`, `path`, `description`, and `articleLabel`.
- `lib/data-loader.ts` — static imports of all book JSONs + tree traversal utilities (`findNodeByNumber`, `collectNavigableNodes`, `extractArticles`, etc.). Adding a new book requires a new static import here and registration in `BOOK_DATA`.
- `lib/types.ts` — TypeScript interfaces (`Law`, `Book`, `Chapter`, `Article`, etc.)

The JSON tree uses heterogeneous children keys (`chapters`, `sections`, `branches`, `articles`, `subsections`). `CHILDREN_KEYS` in `data-loader.ts` defines the traversal order.

## Critical conventions

- **Semantic article labels**: `cpp` (Criminal Procedure Law) uses `"المادة"`, `dp` (Criminal Law) uses `"الفصل"`. Driven by `LawSource.articleLabel` — never hardcode one label.
- **RTL everywhere**: Layout is `dir="rtl"` and `lang="ar"`. Do not assume LTR defaults for padding, margins, flex direction, or text alignment.
- **Tailwind v4**: Uses `@tailwindcss/postcss` (not `tailwind.config.ts`). Theme values are CSS custom properties in `app/globals.css` under `@theme inline`.
- **shadcn/ui**: Add components via `npx shadcn@latest add <component>`. Config is in `components.json` (new-york style, RSC enabled, `lucide-react` icons).
- **Path alias**: `@/*` maps to the project root.
