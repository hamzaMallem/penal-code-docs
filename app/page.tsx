"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { SearchModal } from "@/components/features/SearchModal";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { Book, Scale, Search, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Fuse from "fuse.js";
import type { SearchResult } from "@/lib/types";
import { getLawSources } from "@/lib/law-sources";
import {
  loadBookData,
  findFirstArticle,
  getChildrenArrays,
  isNavigable,
  getNodeLabel,
  getAvailableBookIds,
  type GenericNode,
} from "@/lib/data-loader";

// Searchable article interface
interface SearchableArticle {
  articleNumber: string;
  lawKey: string;
  bookId: string;
  bookName: string;
  chapterName: string;
  sectionName?: string;
  content: string;
}

// Extract all articles from a node recursively
function extractArticles(
  node: GenericNode,
  lawKey: string,
  bookId: string,
  bookName: string,
  path: string[] = []
): SearchableArticle[] {
  const articles: SearchableArticle[] = [];

  // Check if this node is an article
  if (node.number && node.paragraphs) {
    const content = node.paragraphs.join(" ");
    articles.push({
      articleNumber: node.number,
      lawKey,
      bookId,
      bookName,
      chapterName: path[0] || bookName,
      sectionName: path.slice(1).join(" > ") || undefined,
      content,
    });
  }

  // Recursively process children
  const childrenKeys = ["chapters", "sections", "branches", "articles", "subsections"];
  for (const key of childrenKeys) {
    const children = node[key] as GenericNode[] | undefined;
    if (children && Array.isArray(children)) {
      for (const child of children) {
        const childPath =
          child.name || child.title
            ? [...path, `${child.name || ""} ${child.title || ""}`.trim()]
            : path;
        articles.push(...extractArticles(child, lawKey, bookId, bookName, childPath));
      }
    }
  }

  return articles;
}

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [lawBooks, setLawBooks] = useState<
    Record<string, { id: string; name: string; firstArticle?: string }[]>
  >({});
  const [loading, setLoading] = useState(true);

  // Load all books for all law sources
  useEffect(() => {
    const loadAllBooks = async () => {
      const lawSources = getLawSources();
      const booksMap: Record<
        string,
        { id: string; name: string; firstArticle?: string }[]
      > = {};

      for (const lawSource of lawSources) {
        const books: { id: string; name: string; firstArticle?: string }[] = [];

        // Get available book IDs from the static map
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
            // Book doesn't exist, skip
          }
        }

        booksMap[lawSource.key] = books;
      }

      setLawBooks(booksMap);
      setLoading(false);
    };

    loadAllBooks();
  }, []);

  // Build searchable articles from all law sources
  const searchableArticles = useMemo(() => {
    const allArticles: SearchableArticle[] = [];

    const loadArticles = async () => {
      const lawSources = getLawSources();

      for (const lawSource of lawSources) {
        const books = lawBooks[lawSource.key] || [];

        for (const book of books) {
          try {
            const bookData = await loadBookData(lawSource.key, book.id);
            if (bookData) {
              const bookArticles = extractArticles(
                bookData,
                lawSource.key,
                book.id,
                book.name
              );
              allArticles.push(...bookArticles);
            }
          } catch {
            // Skip if book fails to load
          }
        }
      }
    };

    loadArticles();
    return allArticles;
  }, [lawBooks]);

  // Initialize Fuse.js search engine
  const fuse = useMemo(() => {
    return new Fuse(searchableArticles, {
      keys: [
        { name: "articleNumber", weight: 2 },
        { name: "content", weight: 1 },
      ],
      threshold: 0.3,
      minMatchCharLength: 2,
      includeScore: true,
      includeMatches: true,
      findAllMatches: true,
      ignoreLocation: true,
    });
  }, [searchableArticles]);

  // Search function to pass to SearchModal
  const handleSearch = useCallback((query: string): SearchResult[] => {
    if (query.length < 2) {
      return [];
    }

    const results = fuse.search(query, { limit: 20 });

    return results.map((result) => {
      const item = result.item;
      const matches = result.matches || [];

      // Extract matched text with context
      let matchedText = item.content;
      if (matches.length > 0) {
        const contentMatch = matches.find((m) => m.key === "content");
        if (contentMatch && contentMatch.indices && contentMatch.indices.length > 0) {
          const [start, end] = contentMatch.indices[0];
          const contextStart = Math.max(0, start - 50);
          const contextEnd = Math.min(item.content.length, end + 100);
          matchedText =
            (contextStart > 0 ? "..." : "") +
            item.content.slice(contextStart, contextEnd) +
            (contextEnd < item.content.length ? "..." : "");
        }
      }

      return {
        articleNumber: item.articleNumber,
        lawKey: item.lawKey,
        bookName: item.bookId,
        chapterName: item.chapterName,
        sectionName: item.sectionName,
        content: item.content,
        matchedText,
        score: result.score || 0,
      };
    });
  }, [fuse]);

  // Keyboard navigation
  useKeyboardNav({
    onSearchOpen: () => setIsSearchOpen(true),
    onEscape: () => {
      setIsSearchOpen(false);
      setIsSidebarOpen(false);
    },
  });

  // Navigation items for sidebar
  const navItems = useMemo(() => {
    const lawSources = getLawSources();
    const items = [];

    for (const lawSource of lawSources) {
      const books = lawBooks[lawSource.key] || [];
      items.push({
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
      });
    }

    return items;
  }, [lawBooks]);

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
          <div className="container mx-auto px-4 py-8">
            {/* Hero Section */}
            <section className="text-center py-12 mb-12">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Scale className="h-16 w-16 text-primary" />
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                قانون دوكس
              </h1>

              <p className="text-xl text-muted-foreground mb-2">
                منصة القوانين المغربية
              </p>

              <p className="text-lg text-muted-foreground mb-8">
                تصفح القوانين المغربية مع بحث فوري وتنقل سهل
              </p>

              <Button
                size="lg"
                onClick={() => setIsSearchOpen(true)}
                className="gap-2"
              >
                <Search className="h-5 w-5" />
                ابدأ البحث
                <kbd className="mr-2 px-2 py-0.5 bg-primary-foreground/20 rounded text-xs">
                  ⌘K
                </kbd>
              </Button>
            </section>

            {/* Law Collections */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">مجموعات القوانين</h2>
              <div className="space-y-8">
                {getLawSources().map((lawSource) => {
                  const books = lawBooks[lawSource.key] || [];
                  return (
                    <div
                      key={lawSource.key}
                      className="bg-card rounded-lg border border-border p-6"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground">
                            {lawSource.label}
                          </h3>
                          {lawSource.description && (
                            <p className="text-sm text-muted-foreground">
                              {lawSource.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                      ) : books.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-3">
                          {books.map((book) => (
                            <a
                              key={book.id}
                              href={
                                book.firstArticle
                                  ? `/${lawSource.key}/${book.id}/${book.firstArticle}`
                                  : `/${lawSource.key}/${book.id}`
                              }
                              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                            >
                              <Book className="h-4 w-4 text-primary shrink-0" />
                              <span className="font-medium">{book.name}</span>
                              <ChevronRight className="h-4 w-4 text-muted-foreground mr-auto" />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-4">
                          لا توجد كتب متاحة
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Keyboard Shortcuts */}
            <section className="p-6 rounded-lg border border-border bg-card">
              <h2 className="text-xl font-bold mb-4">اختصارات لوحة المفاتيح</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">فتح البحث</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-sm">⌘K</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">المادة التالية</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-sm">←</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">المادة السابقة</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-sm">→</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">إغلاق</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-sm">Esc</kbd>
                </div>
              </div>
            </section>
          </div>

          <Footer />
        </main>
      </div>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={handleSearch}
      />
    </div>
  );
}
