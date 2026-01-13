"use client";

import { Copy, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Article, BreadcrumbItem } from "@/lib/types";

interface ArticleViewProps {
  article: Article;
  bookTitle?: string;
  chapterTitle?: string;
  sectionTitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  articleLabel?: string; // "المادة" for cpp, "الفصل" for dp
  lawLabel?: string; // Law name for sharing
}

/**
 * ArticleView - Displays legal article content
 * عرض المادة القانونية
 * 
 * Mobile Optimizations:
 * - Increased line-height (1.9-2.1) for Arabic text readability
 * - Larger font size on mobile
 * - Better paragraph spacing
 * - Max-width container for optimal reading
 */
export function ArticleView({
  article,
  bookTitle,
  chapterTitle,
  sectionTitle,
  breadcrumbs = [],
  articleLabel = "المادة",
  lawLabel = "قانون المسطرة الجنائية",
}: ArticleViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = `${articleLabel} ${article.number}\n\n${article.paragraphs.join("\n\n")}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${articleLabel} ${article.number} - ${lawLabel}`,
        text: article.paragraphs[0],
        url: window.location.href,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <article className="max-w-3xl mx-auto">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="mb-6" aria-label="مسار التنقل">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            {breadcrumbs.map((item, index) => (
              <li key={item.href} className="flex items-center gap-2">
                {index > 0 && <span>/</span>}
                <a
                  href={item.href}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Article Header */}
      <header className="mb-6 md:mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className={cn(
              "font-bold text-foreground mb-2",
              // Mobile: slightly smaller title
              "text-2xl md:text-3xl"
            )}>
              {articleLabel} {article.number}
            </h1>
            {(bookTitle || chapterTitle || sectionTitle) && (
              <div className="text-sm text-muted-foreground space-y-1">
                {bookTitle && <p>{bookTitle}</p>}
                {chapterTitle && <p>{chapterTitle}</p>}
                {sectionTitle && <p>{sectionTitle}</p>}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              aria-label="نسخ المادة"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
              aria-label="مشاركة المادة"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Article Content - Mobile Reading Mode */}
      <div 
        className={cn(
          "article-content dark:prose-invert max-w-none",
          // Mobile reading optimizations
          "mobile-reading-mode"
        )}
      >
        {article.paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className={cn(
              "text-foreground",
              // Base styles
              "mb-4 md:mb-5",
              // Mobile: Enhanced readability
              // - Larger line-height for Arabic text
              // - Slightly larger font
              // - Better word spacing
              "leading-[2] md:leading-relaxed",
              "text-[17px] md:text-[18px]",
              // Ensure proper text rendering
              "text-right"
            )}
            style={{ 
              fontSize: 'var(--font-size-base)',
              // Mobile-specific overrides via CSS custom properties
              wordSpacing: '0.05em',
            }}
          >
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}
