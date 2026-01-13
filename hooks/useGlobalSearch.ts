"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import Fuse from "fuse.js";
import type { SearchResult } from "@/lib/types";
import {
  getAllSearchableArticles,
  type SearchableArticle,
} from "@/lib/data-loader";

/**
 * Hook for global search functionality across all law sources
 * يوفر وظيفة البحث الشامل في جميع مصادر القوانين
 */
export function useGlobalSearch() {
  const [searchableArticles, setSearchableArticles] = useState<SearchableArticle[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all searchable articles on mount
  useEffect(() => {
    getAllSearchableArticles().then((articles) => {
      setSearchableArticles(articles);
      setLoading(false);
    });
  }, []);

  // Initialize Fuse.js search engine
  const fuse = useMemo(() => {
    if (loading || searchableArticles.length === 0) {
      return null;
    }
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
  }, [searchableArticles, loading]);

  // Search function to pass to SearchModal
  const search = useCallback((query: string): SearchResult[] => {
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
        bookName: item.bookId, // Use bookId for URL
        chapterName: item.chapterName,
        sectionName: item.sectionName,
        content: item.content,
        matchedText,
        score: result.score || 0,
      };
    });
  }, [fuse]);

  return {
    search,
    totalArticles: searchableArticles.length,
    loading,
  };
}
