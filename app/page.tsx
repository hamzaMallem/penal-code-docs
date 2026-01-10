"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { SearchModal } from "@/components/features/SearchModal";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { Book, Scale, Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import Fuse from "fuse.js";
import type { SearchResult } from "@/lib/types";

// Static imports for all book data files
import book0Data from "@/data/code_procedure_penale/book_0.json";
import book1Data from "@/data/code_procedure_penale/book_1st.json";
import book2Data from "@/data/code_procedure_penale/book_2nd.json";
import book3Data from "@/data/code_procedure_penale/book_3rd.json";
import book4Data from "@/data/code_procedure_penale/book_4th.json";
import book5Data from "@/data/code_procedure_penale/book_5th.json";
import book6Data from "@/data/code_procedure_penale/book_6th.json";
import book7Data from "@/data/code_procedure_penale/book_7th.json";
import book8Data from "@/data/code_procedure_penale/book_8th.json";

// Generic node interface for JSON data
interface GenericNode {
  name?: string;
  title?: string;
  number?: string;
  paragraphs?: string[];
  chapters?: GenericNode[];
  sections?: GenericNode[];
  branches?: GenericNode[];
  articles?: GenericNode[];
  subsections?: GenericNode[];
  [key: string]: unknown;
}

// Searchable article interface
interface SearchableArticle {
  articleNumber: string;
  bookName: string;
  bookId: string;
  chapterName: string;
  sectionName?: string;
  content: string;
}

// Book data mapping
const bookDataMap: Record<string, { data: GenericNode; id: string; name: string }> = {
  book_0: { data: book0Data as GenericNode, id: "book_0", name: "أحكام تمهيدية" },
  book_1: { data: book1Data as GenericNode, id: "book_1", name: "الكتاب الأول" },
  book_2: { data: book2Data as GenericNode, id: "book_2", name: "الكتاب الثاني" },
  book_3: { data: book3Data as GenericNode, id: "book_3", name: "الكتاب الثالث" },
  book_4: { data: book4Data as GenericNode, id: "book_4", name: "الكتاب الرابع" },
  book_5: { data: book5Data as GenericNode, id: "book_5", name: "الكتاب الخامس" },
  book_6: { data: book6Data as GenericNode, id: "book_6", name: "الكتاب السادس" },
  book_7: { data: book7Data as GenericNode, id: "book_7", name: "الكتاب السابع" },
  book_8: { data: book8Data as GenericNode, id: "book_8", name: "الكتاب الثامن" },
};

// Known children property names in the JSON structure
const CHILDREN_KEYS = ["chapters", "sections", "branches", "articles", "subsections"];

// Get all children arrays from a node
function getChildrenArrays(node: GenericNode): { key: string; children: GenericNode[] }[] {
  const result: { key: string; children: GenericNode[] }[] = [];
  
  for (const key of CHILDREN_KEYS) {
    const children = node[key] as GenericNode[] | undefined;
    if (children && Array.isArray(children) && children.length > 0) {
      result.push({ key, children });
    }
  }
  
  return result;
}

// Check if a node is navigable (has a number property)
function isNavigable(node: GenericNode): boolean {
  return typeof node.number === "string" && node.number.length > 0;
}

// Find the first article (navigable node) in a tree recursively
function findFirstArticle(node: GenericNode): GenericNode | null {
  // If this node itself is an article, return it
  if (isNavigable(node)) {
    return node;
  }
  
  // Otherwise, search through all children arrays
  const childrenArrays = getChildrenArrays(node);
  for (const { children } of childrenArrays) {
    for (const child of children) {
      const article = findFirstArticle(child);
      if (article) {
        return article;
      }
    }
  }
  
  return null;
}

// Extract all articles from a node recursively
function extractArticles(
  node: GenericNode,
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
      bookName: bookName,
      bookId: bookId,
      chapterName: path[0] || bookName,
      sectionName: path.slice(1).join(" > ") || undefined,
      content: content,
    });
  }
  
  // Recursively process children
  const childrenKeys = ["chapters", "sections", "branches", "articles", "subsections"];
  for (const key of childrenKeys) {
    const children = node[key] as GenericNode[] | undefined;
    if (children && Array.isArray(children)) {
      for (const child of children) {
        const childPath = child.name || child.title 
          ? [...path, `${child.name || ""} ${child.title || ""}`.trim()]
          : path;
        articles.push(...extractArticles(child, bookId, bookName, childPath));
      }
    }
  }
  
  return articles;
}

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Build searchable articles from all books
  const searchableArticles = useMemo(() => {
    const allArticles: SearchableArticle[] = [];
    
    for (const [bookId, bookInfo] of Object.entries(bookDataMap)) {
      const bookArticles = extractArticles(bookInfo.data, bookId, bookInfo.name);
      allArticles.push(...bookArticles);
    }
    
    return allArticles;
  }, []);
  
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
        bookName: item.bookId, // Use bookId for URL
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

  // Navigation items with first article links
  const navItems = useMemo(() => {
    const items = [
      { id: "book_0", label: "أحكام تمهيدية", bookId: "book_0" },
      { id: "book_1", label: "الكتاب الأول: ممارسة الدعوى العمومية والتحقيق الإعدادي", bookId: "book_1" },
      { id: "book_2", label: "الكتاب الثاني: الحكم في الجنايات والجنح والمخالفات", bookId: "book_2" },
      { id: "book_3", label: "الكتاب الثالث: طرق الطعن غير العادية", bookId: "book_3" },
      { id: "book_4", label: "الكتاب الرابع: مساطر خاصة", bookId: "book_4" },
      { id: "book_5", label: "الكتاب الخامس: التنفيذ", bookId: "book_5" },
      { id: "book_6", label: "الكتاب السادس: أحكام انتقالية وختامية", bookId: "book_6" },
      { id: "book_7", label: "الكتاب السابع: الاختصاص المتعلق ببعض الجرائم المرتكبة خارج المملكة والتعاون الدولي", bookId: "book_7" },
      { id: "book_8", label: "الكتاب الثامن: أحكام مختلفة وختامية", bookId: "book_8" },
    ];

    return items.map(item => {
      const bookInfo = bookDataMap[item.bookId];
      if (bookInfo) {
        const firstArticle = findFirstArticle(bookInfo.data);
        return {
          id: item.id,
          label: item.label,
          href: firstArticle ? `/${item.bookId}/${firstArticle.number}` : `/${item.bookId}`,
          children: [],
        };
      }
      return {
        id: item.id,
        label: item.label,
        href: `/${item.bookId}`,
        children: [],
      };
    });
  }, []);

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
                قانون المسطرة الجنائية
              </h1>
              
              <p className="text-xl text-muted-foreground mb-2">
                القانون رقم 22.01 المعدل بالقانون رقم 03.23
              </p>
              
              <p className="text-lg text-muted-foreground mb-8">
                679 مادة قانونية مع بحث فوري وتصفح سهل
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

            {/* Quick Links */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">الكتب</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {navItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    className="p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Book className="h-5 w-5 text-primary shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </a>
                ))}
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
