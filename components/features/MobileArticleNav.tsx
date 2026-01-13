"use client";

import { ChevronRight, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { ArticleNavigation } from "@/lib/types";

interface MobileArticleNavProps {
  navigation: ArticleNavigation;
  articleLabel?: string;
}

const MOBILE_BREAKPOINT = 768;

/**
 * Mobile-only sticky bottom navigation for articles
 * شريط التنقل السفلي الثابت للجوال
 * 
 * Features:
 * - Large touch targets (48px min height)
 * - Positioned for thumb reach
 * - RTL-aware (السابق on right, التالي on left)
 * - Hidden on desktop
 */
export function MobileArticleNav({ navigation, articleLabel = "المادة" }: MobileArticleNavProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { previous, next } = navigation;

  // Detect mobile viewport (client-side only)
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Don't render on desktop or before mount
  if (!mounted || !isMobile) {
    return null;
  }

  // Don't render if no navigation available
  if (!previous && !next) {
    return null;
  }

  return (
    <>
      {/* Spacer to prevent content from being hidden behind fixed nav */}
      <div className="h-20 md:hidden" aria-hidden="true" />

      {/* Fixed bottom navigation */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40",
          "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
          "border-t border-border",
          "px-4 py-3",
          "md:hidden" // Hide on desktop
        )}
        aria-label="التنقل بين المواد"
      >
        <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
          {/* Previous button (RIGHT side in RTL) */}
          {previous ? (
            <a
              href={previous.href}
              className={cn(
                "flex-1 flex items-center justify-center gap-2",
                "min-h-[48px] px-4 py-2 rounded-lg",
                "bg-muted hover:bg-accent active:bg-accent/80",
                "transition-colors duration-150",
                "text-foreground"
              )}
              aria-label={`السابق: ${articleLabel} ${previous.number}`}
            >
              <ChevronRight className="h-5 w-5 shrink-0" />
              <div className="text-right min-w-0">
                <span className="block text-xs text-muted-foreground">السابق</span>
                <span className="block text-sm font-medium truncate">
                  {articleLabel} {previous.number}
                </span>
              </div>
            </a>
          ) : (
            <div className="flex-1" />
          )}

          {/* Next button (LEFT side in RTL) */}
          {next ? (
            <a
              href={next.href}
              className={cn(
                "flex-1 flex items-center justify-center gap-2",
                "min-h-[48px] px-4 py-2 rounded-lg",
                "bg-primary hover:bg-primary/90 active:bg-primary/80",
                "transition-colors duration-150",
                "text-primary-foreground"
              )}
              aria-label={`التالي: ${articleLabel} ${next.number}`}
            >
              <div className="text-left min-w-0">
                <span className="block text-xs text-primary-foreground/80">التالي</span>
                <span className="block text-sm font-medium truncate">
                  {articleLabel} {next.number}
                </span>
              </div>
              <ChevronLeft className="h-5 w-5 shrink-0" />
            </a>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </nav>
    </>
  );
}
