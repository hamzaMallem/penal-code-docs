"use client";

import * as React from "react";
import { Search, FileText, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SearchResult } from "@/lib/types";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (query: string) => SearchResult[];
}

export function SearchModal({ isOpen, onClose, onSearch }: SearchModalProps) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

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
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="ابحث عن مادة أو نص قانوني..."
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
                يمكنك البحث برقم المادة أو بالنص القانوني
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
              {results.map((result, index) => (
                <a
                  key={index}
                  href={`/${result.lawKey}/${result.bookName}/${result.articleNumber}`}
                  className="block p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                  onClick={handleClose}
                >
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          المادة {result.articleNumber}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {result.bookName} - {result.chapterName}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {result.matchedText}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
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
