"use client";

import { Copy, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { Article, BreadcrumbItem } from "@/lib/types";

interface ArticleViewProps {
  article: Article;
  bookTitle?: string;
  chapterTitle?: string;
  sectionTitle?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export function ArticleView({
  article,
  bookTitle,
  chapterTitle,
  sectionTitle,
  breadcrumbs = [],
}: ArticleViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = `المادة ${article.number}\n\n${article.paragraphs.join("\n\n")}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `المادة ${article.number} - قانون المسطرة الجنائية`,
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
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              المادة {article.number}
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

      {/* Article Content */}
      <div className="article-content dark:prose-invert max-w-none">
        {article.paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className="mb-4 leading-relaxed text-foreground"
            style={{ fontSize: 'var(--font-size-base)' }}
          >
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}
