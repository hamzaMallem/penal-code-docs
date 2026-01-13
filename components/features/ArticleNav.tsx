"use client";

import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ArticleNavigation } from "@/lib/types";

interface ArticleNavProps {
  navigation: ArticleNavigation;
  articleLabel?: string; // "المادة" for cpp, "الفصل" for dp
}

export function ArticleNav({ navigation, articleLabel = "المادة" }: ArticleNavProps) {
  const { previous, next } = navigation;

  return (
    <nav className="flex items-center justify-between border-t border-border pt-6 mt-8">
      {previous ? (
        <a href={previous.href}>
          <Button variant="outline" className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4" />
            <div className="text-right">
              <span className="block text-xs text-muted-foreground">السابق</span>
              <span className="block">{articleLabel} {previous.number}</span>
            </div>
          </Button>
        </a>
      ) : (
        <div></div>
      )}

      {next ? (
        <a href={next.href}>
          <Button variant="outline" className="flex items-center gap-2">
            <div className="text-left">
              <span className="block text-xs text-muted-foreground">التالي</span>
              <span className="block">{articleLabel} {next.number}</span>
            </div>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </a>
      ) : (
        <div></div>
      )}
    </nav>
  );
}
