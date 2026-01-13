"use client";

import * as React from "react";
import { Search, FileText, X, Globe, BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SearchResult } from "@/lib/types";
import { formatLegalPath, highlightQuery } from "@/lib/search-utils";
import { getLawSource, getArticleLabel } from "@/lib/law-sources";

/**
 * Search scope type
 * نوع نطاق البحث
 */
export type SearchScope = "global" | { lawKey: string };

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (query: string) => SearchResult[];
  /** Search scope - "global" for all laws, or { lawKey } for contextual search */
  searchScope?: SearchScope;
}

/**
 * Get scope display info
 * الحصول على معلومات عرض النطاق
 */
function getScopeInfo(scope: SearchScope): { label: string; icon: React.ReactNode } {
  if (scope === "global") {
    return {
      label: "البحث في جميع القوانين",
      icon: <Globe className="h-3.5 w-3.5" />,
    };
  }
  
  const lawSource = getLawSource(scope.lawKey);
  return {
    label: `البحث في ${lawSource?.label || "القانون"}`,
    icon: <BookOpen className="h-3.5 w-3.5" />,
  };
}

/**
 * Get law badge for global search results
 * الحصول على شارة القانون لنتائج البحث الشامل
 */
function getLawBadge(lawKey: string): { label: string; color: string } {
  const lawSource = getLawSource(lawKey);
  
  if (lawKey === "cpp") {
    return {
      label: "المسطرة الجنائية",
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    };
  }
  
  if (lawKey === "dp") {
    return {
      label: "القانون الجنائي",
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    };
  }
  
  return {
    label: lawSource?.label || lawKey,
    color: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
  };
}

export function SearchModal({ 
  isOpen, 
  onClose, 
  onSearch,
  searchScope = "global",
}: SearchModalProps) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Get scope display info
  const scopeInfo = getScopeInfo(searchScope);
  const isGlobalSearch = searchScope === "global";

  // Focus input when modal opens
  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle search
  React.useEffect(() => {
    if (query.length >= 2 && onSearch) {
      const searchResults = onSearch(query);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [query, onSearch]);

  // Clear on close
  const handleClose = () => {
    setQuery("");
    setResults([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="sr-only">البحث في القانون</DialogTitle>
          
          {/* Search Scope Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
              {scopeInfo.icon}
              {scopeInfo.label}
            </span>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder={
                isGlobalSearch 
                  ? "ابحث في جميع القوانين..." 
                  : "ابحث عن مادة أو نص قانوني..."
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pr-10 text-base"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] p-4">
          {query.length < 2 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>اكتب كلمتين على الأقل للبحث</p>
              <p className="text-sm mt-2">
                {isGlobalSearch 
                  ? "يمكنك البحث برقم المادة أو بالنص القانوني في جميع القوانين"
                  : "يمكنك البحث برقم المادة أو بالنص القانوني"
                }
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>لا توجد نتائج لـ &quot;{query}&quot;</p>
              <p className="text-sm mt-2">جرب كلمات مختلفة</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-4">
                {results.length} نتيجة
              </p>
              {results.map((result, index) => {
                // Get article label based on law source
                const articleLabel = getArticleLabel(result.lawKey);
                // Get law badge for global search
                const lawBadge = isGlobalSearch ? getLawBadge(result.lawKey) : null;
                // Build navigation URL using bookId
                const href = `/${result.lawKey}/${result.bookId}/${result.articleNumber}`;

                return (
                  <a
                    key={`${result.lawKey}-${result.bookId}-${result.articleNumber}-${index}`}
                    href={href}
                    className="block p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                    onClick={handleClose}
                    dir="rtl"
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0 text-right">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-medium">
                            {articleLabel} {result.articleNumber}
                          </span>
                          {/* Law badge for global search */}
                          {lawBadge && (
                            <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full border ${lawBadge.color}`}>
                              {lawBadge.label}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground block mb-2">
                          {formatLegalPath(result)}
                        </span>
                        <p 
                          className="text-sm text-muted-foreground line-clamp-2"
                          dangerouslySetInnerHTML={{ 
                            __html: highlightQuery(result.matchedText, query) 
                          }}
                        />
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="border-t border-border p-3 text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↵</kbd>
              للفتح
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↑↓</kbd>
              للتنقل
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Esc</kbd>
              للإغلاق
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
