"use client";

import { useState, useCallback, useMemo } from "react";
import Fuse, { FuseResult } from "fuse.js";
import type { SearchResult } from "@/lib/types";

interface SearchableArticle {
  articleNumber: string;
  lawKey: string;
  bookName: string;
  chapterName: string;
  sectionName?: string;
  content: string;
}

interface UseSearchOptions {
  threshold?: number;
  minMatchCharLength?: number;
  keys?: string[];
}

export function useSearch(
  articles: SearchableArticle[],
  options: UseSearchOptions = {}
) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const {
    threshold = 0.3,
    minMatchCharLength = 2,
    keys = ["content", "articleNumber"],
  } = options;

  // Initialize Fuse.js
  const fuse = useMemo(() => {
    return new Fuse(articles, {
      keys,
      threshold,
      minMatchCharLength,
      includeScore: true,
      includeMatches: true,
      findAllMatches: true,
      ignoreLocation: true,
    });
  }, [articles, keys, threshold, minMatchCharLength]);

  // Search function
  const search = useCallback(
    (searchQuery: string): SearchResult[] => {
      if (searchQuery.length < minMatchCharLength) {
        return [];
      }

      setIsSearching(true);
      const fuseResults: FuseResult<SearchableArticle>[] = fuse.search(searchQuery);

      const searchResults: SearchResult[] = fuseResults.map((result: FuseResult<SearchableArticle>) => {
        const item = result.item;
        const matches = result.matches || [];
        
        // Get the matched text with context
        let matchedText = item.content;
        if (matches.length > 0 && matches[0].indices.length > 0) {
          const [start, end] = matches[0].indices[0];
          const contextStart = Math.max(0, start - 50);
          const contextEnd = Math.min(item.content.length, end + 50);
          matchedText = 
            (contextStart > 0 ? "..." : "") +
            item.content.slice(contextStart, contextEnd) +
            (contextEnd < item.content.length ? "..." : "");
        }

        return {
          articleNumber: item.articleNumber,
          lawKey: item.lawKey,
          bookName: item.bookName,
          chapterName: item.chapterName,
          sectionName: item.sectionName,
          content: item.content,
          matchedText,
          score: result.score || 0,
        };
      });

      setIsSearching(false);
      return searchResults.slice(0, 20); // Limit to 20 results
    },
    [fuse, minMatchCharLength]
  );

  // Handle query change
  const handleSearch = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);
      const searchResults = search(newQuery);
      setResults(searchResults);
    },
    [search]
  );

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
  }, []);

  return {
    query,
    results,
    isSearching,
    search,
    handleSearch,
    clearSearch,
  };
}
