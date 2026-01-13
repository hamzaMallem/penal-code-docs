"use client";

import { useCallback, useMemo } from "react";
import Fuse from "fuse.js";
import type { SearchResult } from "@/lib/types";
import { getArticlesForLaw } from "@/lib/search/global-search";
import type { SearchableArticle } from "@/lib/data-loader";

/**
 * Hook for contextual search within a specific law source
 * خطاف للبحث السياقي داخل مصدر قانون محدد
 * 
 * @param lawKey - The law source key (e.g., "cpp", "dp")
 * @returns Search function and metadata
 */
export function useLawSearch(lawKey: string) {
  // Get articles for this specific law (memoized at module level)
  const lawArticles = useMemo(() => {
    return getArticlesForLaw(lawKey);
  }, [lawKey]);

  // Create Fuse index for this law's articles
  const fuse = useMemo(() => {
    if (lawArticles.length === 0) {
      return null;
    }
    return new Fuse(lawArticles, {
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
  }, [lawArticles]);

  // Search function
  const search = useCallback(
    (query: string): SearchResult[] => {
      if (query.length < 2 || !fuse) {
        return [];
      }

      const results = fuse.search(query, { limit: 20 });

      return results.map((result) => {
        const item = result.item as SearchableArticle;
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
    },
    [fuse]
  );

  return {
    search,
    totalArticles: lawArticles.length,
    isReady: lawArticles.length > 0,
  };
}
