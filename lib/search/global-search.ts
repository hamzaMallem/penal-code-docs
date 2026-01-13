/**
 * Global Search Engine - محرك البحث الشامل
 * 
 * Provides centralized, memoized search functionality across all law sources.
 * SSR-safe implementation using static imports.
 */

import Fuse, { IFuseOptions } from "fuse.js";
import type { SearchResult } from "../types";
import { getLawSources, getArticleLabel } from "../law-sources";
import {
  getAvailableBookIds,
  loadBookDataSync,
  extractArticles,
  getNodeLabel,
  type SearchableArticle,
} from "../data-loader";

// Fuse.js configuration optimized for Arabic text
const FUSE_OPTIONS: IFuseOptions<SearchableArticle> = {
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
};

// Singleton cache for global search
let cachedArticles: SearchableArticle[] | null = null;
let cachedFuseIndex: Fuse<SearchableArticle> | null = null;

/**
 * Load all searchable articles from all law sources (synchronous)
 * تحميل جميع المواد القابلة للبحث من جميع مصادر القوانين (متزامن)
 */
function loadAllArticlesSync(): SearchableArticle[] {
  if (cachedArticles !== null) {
    return cachedArticles;
  }

  const allArticles: SearchableArticle[] = [];
  const lawSources = getLawSources();

  for (const lawSource of lawSources) {
    const bookIds = getAvailableBookIds(lawSource.key);

    for (const bookId of bookIds) {
      const bookData = loadBookDataSync(lawSource.key, bookId);
      if (bookData) {
        const bookName = bookData.name || getNodeLabel(bookData, lawSource.key);
        const bookTitle = bookData.title || "";
        const bookArticles = extractArticles(
          bookData,
          lawSource.key,
          bookId,
          bookName,
          bookTitle
        );
        allArticles.push(...bookArticles);
      }
    }
  }

  cachedArticles = allArticles;
  return allArticles;
}

/**
 * Get or create the global Fuse.js search index
 * الحصول على أو إنشاء فهرس البحث الشامل
 */
export function getGlobalSearchIndex(): Fuse<SearchableArticle> {
  if (cachedFuseIndex !== null) {
    return cachedFuseIndex;
  }

  const articles = loadAllArticlesSync();
  cachedFuseIndex = new Fuse(articles, FUSE_OPTIONS);
  return cachedFuseIndex;
}

/**
 * Get all searchable articles (cached)
 * الحصول على جميع المواد القابلة للبحث (مخزنة مؤقتاً)
 */
export function getAllArticles(): SearchableArticle[] {
  return loadAllArticlesSync();
}

/**
 * Get total article count
 * الحصول على إجمالي عدد المواد
 */
export function getTotalArticleCount(): number {
  return loadAllArticlesSync().length;
}

/**
 * Perform global search across all law sources
 * إجراء بحث شامل في جميع مصادر القوانين
 */
export function globalSearch(query: string, limit: number = 20): SearchResult[] {
  if (query.length < 2) {
    return [];
  }

  const fuse = getGlobalSearchIndex();
  const results = fuse.search(query, { limit });

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
 * Perform contextual search within a specific law source
 * إجراء بحث سياقي داخل مصدر قانون محدد
 */
export function contextualSearch(
  lawKey: string,
  query: string,
  limit: number = 20
): SearchResult[] {
  if (query.length < 2) {
    return [];
  }

  // Filter articles for this law source
  const allArticles = loadAllArticlesSync();
  const lawArticles = allArticles.filter((article) => article.lawKey === lawKey);

  // Create a temporary Fuse index for this law
  const fuse = new Fuse(lawArticles, FUSE_OPTIONS);
  const results = fuse.search(query, { limit });

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
 * Get articles for a specific law source (for contextual search index)
 * الحصول على مواد مصدر قانون محدد (لفهرس البحث السياقي)
 */
export function getArticlesForLaw(lawKey: string): SearchableArticle[] {
  const allArticles = loadAllArticlesSync();
  return allArticles.filter((article) => article.lawKey === lawKey);
}
