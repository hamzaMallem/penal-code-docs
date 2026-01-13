"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { SearchModal } from "@/components/features/SearchModal";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { ChevronLeft, Home, Book, FileText, ChevronRight } from "lucide-react";
import {
  loadBookData,
  findFirstArticle,
  getNodeLabel,
  getAvailableBookIds,
  collectNavigableNodes,
  type GenericNode,
} from "@/lib/data-loader";
import { getLawSource, getLawSources } from "@/lib/law-sources";

/**
 * Law Root Page - صفحة القانون الرئيسية
 * 
 * This page displays:
 * - Law title and description
 * - List of all books for this law
 * - Acts as landing page when clicking the law name in sidebar/breadcrumb
 * 
 * Route: /[lawKey] (e.g., /cpp, /dp)
 */
export default function LawPage() {
  const params = useParams();
  const lawKey = params.lawKey as string;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [books, setBooks] = useState<
    { id: string; name: string; title?: string; articleCount: number; firstArticle?: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Global search
  const { search } = useGlobalSearch();

  // Keyboard navigation
  useKeyboardNav({
    onSearchOpen: () => setIsSearchOpen(true),
    onEscape: () => {
      setIsSearchOpen(false);
      setIsSidebarOpen(false);
    },
  });

  // Get law source info
  const lawSource = getLawSource(lawKey);

  // Load all books for this law
  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);
      setError(null);

      // Validate law source
      if (!lawSource) {
        setError("القانون غير موجود");
        setLoading(false);
        return;
      }

      try {
        const bookIds = getAvailableBookIds(lawKey);
        const loadedBooks: typeof books = [];

        for (const bookId of bookIds) {
          const bookData = await loadBookData(lawKey, bookId);
          if (bookData) {
            const firstArticle = findFirstArticle(bookData);
            const allArticles = collectNavigableNodes(bookData);
            
            loadedBooks.push({
              id: bookId,
              name: bookData.name || getNodeLabel(bookData, lawKey),
              title: bookData.title,
              articleCount: allArticles.length,
              firstArticle: firstArticle?.number,
            });
          }
        }

        setBooks(loadedBooks);
        setLoading(false);
      } catch (err) {
        console.error("Error loading books:", err);
        setError("حدث خطأ أثناء تحميل الكتب");
        setLoading(false);
      }
    };

    loadBooks();
  }, [lawKey, lawSource]);

  // Build navigation items for sidebar
  const navItems = useMemo(() => {
    const lawSources = getLawSources();
    return lawSources.map((source) => ({
      id: source.key,
      label: source.label,
      href: `/${source.key}`,
      isExpanded: source.key === lawKey,
      children: source.key === lawKey
        ? books.map((book) => ({
            id: book.id,
            label: book.name,
            href: `/${lawKey}/${book.id}`,
            children: [],
          }))
        : [],
    }));
  }, [lawKey, books]);

  // Calculate total articles
  const totalArticles = books.reduce((sum, book) => sum + book.articleCount, 0);

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
          lawKey={lawKey}
        />

        <main className="flex-1 sidebar-margin">
          <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link href="/" className="hover:text-primary flex items-center gap-1">
                <Home className="h-4 w-4" />
                <span>الرئيسية</span>
              </Link>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-foreground">
                {lawSource?.label || "القانون"}
              </span>
            </nav>

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive text-lg">{error}</p>
                <Link
                  href="/"
                  className="text-primary hover:underline mt-4 inline-block"
                >
                  العودة للرئيسية
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Law Header */}
                <div className="bg-card rounded-lg border border-border p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-foreground mb-2">
                        {lawSource?.label}
                      </h1>
                      {lawSource?.description && (
                        <p className="text-lg text-muted-foreground mb-4">
                          {lawSource.description}
                        </p>
                      )}
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <Book className="h-4 w-4" />
                          {books.length} كتاب
                        </span>
                        <span className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {totalArticles} {lawSource?.articleLabel || "مادة"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Books List */}
                <div>
                  <h2 className="text-2xl font-bold mb-6">الكتب</h2>
                  <div className="grid gap-4">
                    {books.map((book, index) => (
                      <Link
                        key={book.id}
                        href={`/${lawKey}/${book.id}`}
                        className="group bg-card rounded-lg border border-border p-6 hover:border-primary/50 hover:bg-accent/30 transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-primary/10 rounded-lg shrink-0 group-hover:bg-primary/20 transition-colors">
                            <Book className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                              {book.name}
                            </h3>
                            {book.title && (
                              <p className="text-muted-foreground mb-2">
                                {book.title}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              {book.articleCount} {lawSource?.articleLabel || "مادة"}
                            </p>
                          </div>
                          <ChevronLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Quick Navigation */}
                {books.length > 0 && books[0].firstArticle && (
                  <div className="bg-accent/30 rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold mb-3">ابدأ القراءة</h3>
                    <p className="text-muted-foreground mb-4">
                      انتقل مباشرة إلى أول {lawSource?.articleLabel || "مادة"} في القانون
                    </p>
                    <Link
                      href={`/${lawKey}/${books[0].id}/${books[0].firstArticle}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <span>
                        {lawSource?.articleLabel || "المادة"} {books[0].firstArticle}
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          <Footer />
        </main>
      </div>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={search}
      />
    </div>
  );
}
