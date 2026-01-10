# CLAUDE.md - Qanun Docs Project

## 🎯 Project Overview

**Name:** Qanun Docs (قانون دوكس)
**Type:** Legal Documentation Website (like DevDocs.io)
**Language:** Arabic (RTL)
**Content:** Moroccan Criminal Procedure Law (679 articles)

---

## 🛠️ Tech Stack

```
Frontend:     Next.js 14+ (App Router)
Language:     TypeScript
Styling:      Tailwind CSS + shadcn/ui
Search:       Fuse.js
Deployment:   Netlify
```

---

## 📁 Project Structure

```
qanun-docs/
├── app/
│   ├── layout.tsx              # Root layout (RTL, fonts, theme)
│   ├── page.tsx                # Homepage
│   ├── globals.css             # Global styles
│   ├── [bookId]/
│   │   └── [articleId]/
│   │       └── page.tsx        # Article page
│   └── search/
│       └── page.tsx            # Search results
├── components/
│   ├── ui/                     # shadcn components
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   └── features/
│       ├── SearchModal.tsx
│       ├── ArticleView.tsx
│       ├── ArticleNav.tsx
│       └── ThemeToggle.tsx
├── data/
│   └── code_procedure_penale/
│       └── book_0.json
│       └── book_1st.json
├── lib/
│   ├── types.ts                # TypeScript interfaces
│   ├── utils.ts                # Utility functions
│   ├── search.ts               # Fuse.js search engine
│   └── law-utils.ts            # Law data processing
├── hooks/
│   ├── useSearch.ts
│   ├── useTheme.ts
│   └── useKeyboardNav.ts
└── public/
    └── fonts/
```

---

## 🎨 Design System

### Colors (DevDocs-inspired)

```css
/* Dark Mode (Default) */
--bg-primary: #1C1E26;
--bg-sidebar: #282A36;
--text-primary: #F8F8F2;
--text-secondary: #6272A4;
--accent: #5C6BC0;
--border: #44475A;

/* Light Mode */
--bg-primary: #FFFFFF;
--bg-sidebar: #F5F5F5;
--text-primary: #1F2937;
--text-secondary: #6B7280;
--accent: #5C6BC0;
--border: #E5E7EB;
```

### Typography

```css
--font-arabic: 'IBM Plex Sans Arabic', 'Noto Kufi Arabic', sans-serif;
--font-size-body: 18px;
--line-height: 1.8;
```

### Layout

```
Sidebar Width: 280px (desktop)
Content Max Width: 800px
Header Height: 60px
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` / `⌘+K` | Open search |
| `←` | Previous article |
| `→` | Next article |
| `Escape` | Close modal |

---

## 📋 Core Features

### Must Have (MVP)
- [x] Article display with proper formatting
- [x] Sidebar navigation (collapsible tree)
- [x] Instant search (Fuse.js)
- [x] Dark/Light mode
- [x] Responsive design
- [x] Keyboard navigation
- [x] Breadcrumb navigation

### Nice to Have
- [ ] Bookmarks/Favorites
- [ ] Search history
- [ ] PWA offline support
- [ ] Print article
- [ ] Copy article link

---

## 🚫 Constraints

1. **No Backend** - Static site only, data from JSON
2. **Arabic First** - RTL layout, Arabic UI
3. **Performance** - Lighthouse > 90
4. **Accessibility** - WCAG AA compliance

---

## 📝 Coding Standards

### File Naming
- Components: `PascalCase.tsx` (e.g., `SearchModal.tsx`)
- Utilities: `kebab-case.ts` (e.g., `law-utils.ts`)
- Hooks: `camelCase.ts` (e.g., `useSearch.ts`)

### Component Structure
```tsx
// 1. Imports
// 2. Types/Interfaces
// 3. Component
// 4. Export
```

### Comments
- Arabic comments for business logic
- English for technical comments

---

## 🔗 Important Commands

```bash
# Development
npm run dev

# Build
npm run build

# Lint
npm run lint

# Type check
npm run type-check
```

---

## 📚 Data Structure

Law JSON structure:
```typescript
interface Law {
  title: string;           // "قانون المسطرة الجنائية"
  law_number: string;      // "22.01"
  amendment: string;       // "03.23"
  books: Book[];
}

interface Book {
  name: string;            // "الكتاب الأول"
  title: string;
  chapters: Chapter[];
}

interface Chapter {
  name: string;            // "الباب الأول"
  title: string;
  sections?: Section[];
  articles?: Article[];
}

interface Article {
  number: string;          // "1", "2-1"
  paragraphs: string[];
}
```

---

## 🎯 Current Task

When I ask for help, assume:
1. We're building a legal documentation site
2. Target audience: Moroccan lawyers/students
3. Priority: Readability and searchability
4. Style: Clean, professional, like DevDocs.io
