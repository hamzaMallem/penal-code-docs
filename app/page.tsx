"use client";

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { SearchModal } from "@/components/features/SearchModal";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { Book, Scale, Search, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLawSources } from "@/lib/law-sources";
import {
  loadBookData,
  findFirstArticle,
  getNodeLabel,
  getAvailableBookIds,
} from "@/lib/data-loader";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [lawBooks, setLawBooks] = useState<
    Record<string, { id: string; name: string; firstArticle?: string }[]>
  >({});
  const [loading, setLoading] = useState(true);

  // Use centralized global search
  const { search, totalArticles } = useGlobalSearch();

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

              <p className="text-sm text-muted-foreground mb-2">
                بسم الله الرحمن الرحيم
              </p>

              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                قانون دوكس
              </h1>

              {/* Mobile Hero Text */}
              <p className="text-lg text-muted-foreground mb-2 md:hidden">
                موسوعة رقمية لتصفح
                <br />
                قانون المسطرة الجنائية
                <br />
                والقانون الجنائي المغربي
               
              </p>

              <p className="text-sm text-muted-foreground mb-6 md:hidden">
                بحث ذكي · تنقّل مبسّط · قراءة مريحة
              </p>

              {/* Desktop Hero Text */}
              <p className="text-xl text-muted-foreground mb-2 hidden md:block">
                مرحبًا بكم في موسوعة قانون دوكس
              </p>

              <p className="text-lg text-muted-foreground mb-8 leading-relaxed hidden md:block">
                منصة رقمية متخصصة في عرض وتصفح
                <br />
                قانون المسطرة الجنائية ومجموعة القانون الجنائي المغربي،
                <br />
                  في إطار مشروع تحديث تشريعي شامل،  أقرّه المشرّع المغربي بالقانون رقم 03.23.
                <br />
               
             
                <br />
                مع بحث ذكي وتنقّل مبسّط وتجربة قراءة مريحة.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
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

                <Button
                  size="lg"
                  variant="ghost"
                  asChild
                >
                  <a href="/about">
                    حول المنصة
                  </a>
                </Button>
              </div>

              {totalArticles > 0 && (
                <p className="text-sm text-muted-foreground mt-4">
                  ابحث في جميع مواد وفصول القانون الجنائي المغربي بصيغته المحيّنة
                </p>
              )}
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
        onSearch={search}
        searchScope="global"
      />
    </div>
  );
}
