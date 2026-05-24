# AGENTS.md

## Project

**Qanun Docs** — a static-first Next.js PWA for browsing Moroccan penal laws in Arabic (RTL).
No backend, no API routes. All law data lives in static JSON files imported at build time.

## Commands

```bash
npm run dev          # dev server (Next.js with Turbopack)
npm run build        # production build
npm run lint         # ESLint (flat config, eslint-config-next + TypeScript rules)
npm run type-check   # tsc --noEmit
```

No test runner is configured. Run `lint` then `type-check` before considering changes done.

## Architecture

- **Framework**: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui (new-york style)
- **Path alias**: `@/*` → project root
- **Font**: IBM Plex Sans Arabic (`--font-arabic`)
- **Theme**: Dark by default; `next-themes` with `suppressHydrationWarning` on `<body>`
- **Search**: Fuse.js client-side search over all law articles
- **PWA**: Service worker (`public/sw.js`), manifest, offline page

### Routes

| Route | Purpose |
|---|---|
| `/` | Home — law collections list |
| `/[lawKey]` | Law source landing (e.g. `/cpp`, `/dp`) |
| `/[lawKey]/[bookId]` | Book view with tree navigation |
| `/[lawKey]/[bookId]/[articleNumber]` | Individual article |

### Key directories

| Path | Contents |
|---|---|
| `data/cpp/` | 9 JSON files — Criminal Procedure Law (`book_0` … `book_8th`) |
| `data/dp/` | 4 JSON files — Criminal Law (`code_book_0` … `code_book_3`) |
| `lib/law-sources.ts` | Law source registry (`LAW_SOURCES`) — add new laws here |
| `lib/data-loader.ts` | Static imports of all book JSONs + tree traversal utilities |
| `lib/types.ts` | TypeScript interfaces (`Law`, `Book`, `Chapter`, `Article`, etc.) |
| `components/ui/` | shadcn/ui primitives (add via `npx shadcn@latest add ...`) |
| `components/features/` | Feature components (search modal, article view, theme toggle, etc.) |
| `components/layout/` | Header, Sidebar, Footer |
| `components/providers/` | ThemeProvider, ServiceWorkerProvider |
| `hooks/` | Custom hooks (search, keyboard nav, theme, font size, scroll direction) |

## Critical conventions

- **Semantic article labels**: Criminal Procedure Law (`cpp`) uses "المادة"; Criminal Law (`dp`) uses "الفصل". This distinction is driven by `LawSource.articleLabel` in `lib/law-sources.ts`.
- **Static data loading**: All JSON is imported statically in `lib/data-loader.ts` (not fetched). Adding a new book requires adding an import there and registering it in the `BOOK_DATA` map.
- **RTL everywhere**: Layout is `dir="rtl"` and `lang="ar"`. Do not assume LTR defaults.
- **Tailwind v4**: Uses `@tailwindcss/postcss` (not `tailwind.config.ts`). Theme values are CSS custom properties defined in `app/globals.css` under `@theme inline`.
- **shadcn/ui config**: `components.json` — new-york style, RSC enabled, icons from `lucide-react`.
