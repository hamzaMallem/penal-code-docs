"use client";

import { useMemo, useCallback } from "react";
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

// Build all searchable articles (cached at module level)
let cachedArticles: SearchableArticle[] | null = null;

function getAllSearchableArticles(): SearchableArticle[] {
  if (cachedArticles) {
    return cachedArticles;
  }
  
  const allArticles: SearchableArticle[] = [];
  
  for (const [bookId, bookInfo] of Object.entries(bookDataMap)) {
    const bookArticles = extractArticles(bookInfo.data, bookId, bookInfo.name);
    allArticles.push(...bookArticles);
  }
  
  cachedArticles = allArticles;
  return allArticles;
}

/**
 * Hook for global search functionality across all books
 * يوفر وظيفة البحث الشامل في جميع الكتب
 */
export function useGlobalSearch() {
  // Build searchable articles from all books
  const searchableArticles = useMemo(() => {
    return getAllSearchableArticles();
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
  const search = useCallback((query: string): SearchResult[] => {
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
  
  return {
    search,
    totalArticles: searchableArticles.length,
  };
}
