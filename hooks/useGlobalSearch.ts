"use client";

import { useCallback, useMemo } from "react";
import type { SearchResult } from "@/lib/types";
import {
  globalSearch,
  getTotalArticleCount,
  getGlobalSearchIndex,
} from "@/lib/search/global-search";

/**
 * Hook for global search functionality across all law sources
 * يوفر وظيفة البحث الشامل في جميع مصادر القوانين
 * 
 * Uses centralized, memoized search index for optimal performance.
 * SSR-safe - no async loading required.
 */
export function useGlobalSearch() {
  // Ensure index is initialized (synchronous, memoized at module level)
  const isReady = useMemo(() => {
    try {
      getGlobalSearchIndex();
      return true;
    } catch {
      return false;
    }
  }, []);

  // Get total article count
  const totalArticles = useMemo(() => {
    return getTotalArticleCount();
  }, []);

  // Search function using centralized global search
  const search = useCallback((query: string): SearchResult[] => {
    return globalSearch(query, 20);
  }, []);

  return {
    search,
    totalArticles,
    loading: false, // Always ready since we use sync loading
    isReady,
  };
}
