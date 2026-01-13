import Fuse, { IFuseOptions } from "fuse.js";
import type { SearchResult } from "./types";

interface SearchableArticle {
  articleNumber: string;
  lawKey: string;
  bookName: string;
  bookTitle: string;
  bookId: string;
  chapterName: string;
  chapterTitle: string;
  sectionName?: string;
  sectionTitle?: string;
  content: string;
}

// Fuse.js configuration optimized for Arabic text
const fuseOptions: IFuseOptions<SearchableArticle> = {
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
  useExtendedSearch: true,
};

let fuseInstance: Fuse<SearchableArticle> | null = null;
let indexedArticles: SearchableArticle[] = [];

/**
 * Initialize the search engine with articles
 * تهيئة محرك البحث بالمواد
 */
export function initializeSearch(articles: SearchableArticle[]): void {
  indexedArticles = articles;
  fuseInstance = new Fuse(articles, fuseOptions);
}

/**
 * Search for articles
 * البحث عن المواد
 */
export function searchArticles(query: string, limit: number = 20): SearchResult[] {
  if (!fuseInstance || query.length < 2) {
    return [];
  }

  const results = fuseInstance.search(query, { limit });

  return results.map((result) => {
    const item = result.item;
    const matches = result.matches || [];

    // Extract matched text with context
    let matchedText = item.content;
    if (matches.length > 0) {
      const contentMatch = matches.find((m) => m.key === "content");
      if (contentMatch && contentMatch.indices.length > 0) {
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
      bookId: item.bookId,
      bookName: item.bookName,
      bookTitle: item.bookTitle,
      chapterName: item.chapterName,
      chapterTitle: item.chapterTitle,
      sectionName: item.sectionName,
      sectionTitle: item.sectionTitle,
      content: item.content,
      matchedText,
      score: result.score || 0,
    };
  });
}

/**
 * Search by article number
 * البحث برقم المادة
 */
export function searchByArticleNumber(articleNumber: string): SearchableArticle | undefined {
  return indexedArticles.find((article) => article.articleNumber === articleNumber);
}

/**
 * Get search suggestions based on partial input
 * الحصول على اقتراحات البحث
 */
export function getSearchSuggestions(query: string, limit: number = 5): string[] {
  if (!fuseInstance || query.length < 1) {
    return [];
  }

  const results = fuseInstance.search(query, { limit });
  
  // Return unique article numbers as suggestions
  const suggestions = new Set<string>();
  results.forEach((result) => {
    suggestions.add(`المادة ${result.item.articleNumber}`);
  });

  return Array.from(suggestions).slice(0, limit);
}

/**
 * Check if search is initialized
 * التحقق من تهيئة البحث
 */
export function isSearchInitialized(): boolean {
  return fuseInstance !== null;
}

/**
 * Get total indexed articles count
 * الحصول على عدد المواد المفهرسة
 */
export function getIndexedCount(): number {
  return indexedArticles.length;
}
