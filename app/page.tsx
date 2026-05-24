"use client";

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { SearchModal } from "@/components/features/SearchModal";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { Search, ChevronLeft } from "lucide-react";
import { getLawSources } from "@/lib/law-sources";
import {
  loadBookData,
  findFirstArticle,
  getNodeLabel,
  getAvailableBookIds,
} from "@/lib/data-loader";

const LAW_ACCENT: Record<string, string> = {
  cpp: "#2f81f7",
  dp:  "#a371f7",
};

const LAW_LABEL: Record<string, string> = {
  cpp: "ق.م.ج",
  dp:  "ق.ج",
};

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [lawBooks, setLawBooks] = useState<
    Record<string, { id: string; name: string; firstArticle?: string }[]>
  >({});
  const [loading, setLoading] = useState(true);

  const { search } = useGlobalSearch();

  useEffect(() => {
    const loadAllBooks = async () => {
      const lawSources = getLawSources();
      const booksMap: Record<
        string,
        { id: string; name: string; firstArticle?: string }[]
      > = {};

      for (const lawSource of lawSources) {
        const books: { id: string; name: string; firstArticle?: string }[] = [];
        const bookIds = getAvailableBookIds(lawSource.key);

        for (const bookId of bookIds) {
          try {
            const bookData = await loadBookData(lawSource.key, bookId);
            if (bookData) {
              const firstArticle = findFirstArticle(bookData);
              books.push({
                id: bookId,
                name: getNodeLabel(bookData, lawSource.key),
                firstArticle: firstArticle?.number,
              });
            }
          } catch {
            // skip
          }
        }

        booksMap[lawSource.key] = books;
      }

      setLawBooks(booksMap);
      setLoading(false);
    };

    loadAllBooks();
  }, []);

  useKeyboardNav({
    onSearchOpen: () => setIsSearchOpen(true),
    onEscape: () => {
      setIsSearchOpen(false);
      setIsSidebarOpen(false);
    },
  });

  const navItems = useMemo(() => {
    return getLawSources().map((lawSource) => {
      const books = lawBooks[lawSource.key] || [];
      return {
        id: lawSource.key,
        label: lawSource.label,
        href: `/${lawSource.key}`,
        children: books.map((book) => ({
          id: book.id,
          label: book.name,
          href: book.firstArticle
            ? `/${lawSource.key}/${book.id}/${book.firstArticle}`
            : `/${lawSource.key}/${book.id}`,
          children: [],
        })),
      };
    });
  }, [lawBooks]);

  const lawSources = getLawSources();

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onSearchOpen={() => setIsSearchOpen(true)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          navItems={navItems}
        />

        <main className="flex-1 sidebar-margin">
          <div className="container mx-auto px-4 max-w-2xl">

            {/* ── Hero ───────────────────────────────────────── */}
            <section className="pt-16 pb-12 text-center">
              <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight">
                قانونك
              </h1>
              <p className="text-muted-foreground mb-8 text-base">
                التشريع الجنائي المغربي · بحث ونصوص
              </p>

              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card text-right transition-colors hover:border-border/80 hover:bg-card/80"
              >
                <Search className="h-4 w-4 shrink-0 text-muted-foreground order-last" />
                <span className="flex-1 text-sm text-muted-foreground">
                  ابحث عن فصل أو مادة...
                </span>
                <kbd
                  className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground border border-border"
                  style={{ fontFamily: "var(--font-mono, monospace)" }}
                >
                  ⌘K
                </kbd>
              </button>
            </section>

            {/* ── Law Collections ────────────────────────────── */}
            <section className="pb-12 space-y-4">
              {lawSources.map((lawSource) => {
                const accent = LAW_ACCENT[lawSource.key] ?? "#2f81f7";
                const label = LAW_LABEL[lawSource.key] ?? "";
                const books = lawBooks[lawSource.key] || [];

                return (
                  <div
                    key={lawSource.key}
                    className="relative rounded-xl border border-border bg-card overflow-hidden"
                  >
                    {/* Right-edge accent bar */}
                    <div
                      className="absolute top-0 right-0 w-[2px] h-full"
                      style={{ background: accent }}
                    />

                    <div className="p-5">
                      {/* Header */}
                      <div className="flex items-center gap-2.5 mb-4">
                        <span
                          className="text-xs px-2 py-0.5 rounded font-medium"
                          style={{
                            background: `${accent}18`,
                            color: accent,
                            fontFamily: "var(--font-mono, monospace)",
                          }}
                        >
                          {label}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-foreground leading-tight">
                            {lawSource.label}
                          </p>
                          {lawSource.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {lawSource.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="h-px bg-border mb-3" />

                      {/* Books */}
                      {loading ? (
                        <div className="flex justify-center py-6">
                          <div
                            className="w-4 h-4 rounded-full animate-spin"
                            style={{
                              border: `2px solid ${accent}30`,
                              borderTopColor: accent,
                            }}
                          />
                        </div>
                      ) : books.length > 0 ? (
                        <div className="space-y-0.5">
                          {books.map((book, idx) => (
                            <a
                              key={book.id}
                              href={
                                book.firstArticle
                                  ? `/${lawSource.key}/${book.id}/${book.firstArticle}`
                                  : `/${lawSource.key}/${book.id}`
                              }
                              className="group flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent transition-colors"
                            >
                              <span
                                className="text-[0.65rem] w-4 text-center shrink-0 tabular-nums"
                                style={{
                                  fontFamily: "var(--font-mono, monospace)",
                                  color: accent,
                                  opacity: 0.7,
                                }}
                              >
                                {String(idx + 1).padStart(2, "0")}
                              </span>
                              <span className="flex-1 text-sm text-foreground/85">
                                {book.name}
                              </span>
                              <ChevronLeft
                                className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center text-sm py-4">
                          لا توجد كتب متاحة
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </section>

          </div>

          <Footer />
        </main>
      </div>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={search}
        searchScope="global"
      />
    </div>
  );
}
