"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Law-specific display config — abbreviation + accent color
const LAW_CONFIG: Record<string, { abbr: string; accent: string }> = {
  cpp:                  { abbr: "ق.م.ج",   accent: "var(--sg-blue)"   },
  dp:                   { abbr: "ق.ج",     accent: "var(--sg-purple)" },
  "dahir-1974-drogues": { abbr: "ظ.م",     accent: "var(--sg-green)"  },
  "loi-13-21":          { abbr: "ق.13.21", accent: "#f0883e"           },
};

interface PathItem {
  label: string;
  href: string;
}

interface LegalContextBarProps {
  lawKey: string;
  lawLabel: string;
  lawHref: string;
  bookName: string;
  bookHref: string;
  articleLabel: string;   // "المادة" | "الفصل"
  articleNumber: string;
  /**
   * Intermediate ancestors between book and article.
   * Ordered from outermost to innermost (e.g. [القسم الأول, الباب الأول, الفرع الثاني]).
   */
  ancestorPath: PathItem[];
}

export function LegalContextBar({
  lawKey,
  lawLabel,
  lawHref,
  bookName,
  bookHref,
  articleLabel,
  articleNumber,
  ancestorPath,
}: LegalContextBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cfg = LAW_CONFIG[lawKey] ?? { abbr: "ق", accent: "var(--sg-blue)" };

  // Show expand toggle only when there are 2+ intermediate levels.
  // 0 or 1 ancestor → compact path is already complete, no need to expand.
  const hasDeepHierarchy = ancestorPath.length > 1;

  // Immediate parent: the deepest ancestor before the article.
  // Used in the "ضمن:" context label.
  const immediateParent =
    ancestorPath.length > 0 ? ancestorPath[ancestorPath.length - 1] : null;

  // Full path for the expanded block (including home + law + book + ancestors + article)
  const fullPath: PathItem[] = [
    { label: "الرئيسية", href: "/" },
    { label: lawLabel,   href: lawHref  },
    { label: bookName,   href: bookHref },
    ...ancestorPath,
  ];

  return (
    <>
      {/* ── Mobile compact bar ─────────────────────────────────── */}
      <div className="md:hidden mb-6">
        <div
          className={cn(
            "rounded-lg border border-border/60 bg-card overflow-hidden",
            // Reserve min-height during loading to prevent CLS
            "min-h-[68px]"
          )}
        >
          {/* ── Row 1: Back · Law badge · Article number ─── */}
          <div className="flex items-center gap-2 px-3 py-2.5">
            {/* Back to book index — ChevronRight in RTL = go right = go up/back */}
            <Link
              href={bookHref}
              className={cn(
                "shrink-0 flex items-center justify-center",
                "w-8 h-8 rounded-md",
                "bg-muted hover:bg-accent active:bg-accent/80",
                "text-muted-foreground hover:text-foreground",
                "transition-colors duration-150",
                "touch-manipulation"
              )}
              aria-label={`العودة إلى فهرس ${bookName}`}
            >
              <ChevronRight className="h-4 w-4" />
            </Link>

            {/* Law abbreviation badge */}
            <span
              className="shrink-0 text-[10px] font-mono leading-none px-1.5 py-1 rounded select-none"
              style={{ background: `color-mix(in srgb, ${cfg.accent} 12%, transparent)`, color: cfg.accent }}
            >
              {cfg.abbr}
            </span>

            {/* Article number — the primary identity, bold and right-sized */}
            <span className="flex-1 text-sm font-semibold text-foreground leading-tight">
              {articleLabel} {articleNumber}
            </span>
          </div>

          {/* ── Row 2: "ضمن:" context · Expand toggle ────── */}
          <div className="flex items-center gap-2 px-3 pb-2.5 border-t border-border/40 pt-2">
            {/* Context label */}
            <div className="flex-1 min-w-0">
              {immediateParent ? (
                <Link
                  href={immediateParent.href}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors truncate block"
                >
                  <span className="text-muted-foreground/60 ml-0.5">ضمن:</span>{" "}
                  {immediateParent.label}
                </Link>
              ) : (
                <Link
                  href={bookHref}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors truncate block"
                >
                  <span className="text-muted-foreground/60 ml-0.5">ضمن:</span>{" "}
                  {bookName}
                </Link>
              )}
            </div>

            {/* Expand toggle — only for deep hierarchies */}
            {hasDeepHierarchy && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                  "shrink-0 flex items-center gap-0.5",
                  "text-[11px] text-muted-foreground hover:text-foreground",
                  "transition-colors duration-150",
                  "px-1.5 py-1 rounded hover:bg-muted",
                  "touch-manipulation"
                )}
                aria-expanded={isExpanded}
                aria-controls="legal-full-path"
                aria-label={
                  isExpanded
                    ? "إخفاء التسلسل القانوني الكامل"
                    : "عرض التسلسل القانوني الكامل"
                }
              >
                <span>التسلسل</span>
                {isExpanded ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
            )}
          </div>

          {/* ── Expanded: Full legal path block ──────────── */}
          {isExpanded && (
            <div
              id="legal-full-path"
              className="px-3 pb-3 border-t border-border/40 bg-muted/30"
              role="navigation"
              aria-label="التسلسل القانوني الكامل"
            >
              <p className="text-[10px] text-muted-foreground/60 pt-2.5 pb-1.5 font-medium">
                التسلسل القانوني
              </p>
              <ol className="flex flex-wrap items-center gap-x-1 gap-y-1">
                {fullPath.map((item, idx) => (
                  <li key={item.href} className="flex items-center gap-1">
                    {idx > 0 && (
                      <span
                        aria-hidden="true"
                        className="text-muted-foreground/30 text-[11px] select-none"
                        dir="ltr"
                      >
                        /
                      </span>
                    )}
                    <Link
                      href={item.href}
                      className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                {/* Current article — highlighted with law accent */}
                <li className="flex items-center gap-1">
                  <span
                    aria-hidden="true"
                    className="text-muted-foreground/30 text-[11px] select-none"
                    dir="ltr"
                  >
                    /
                  </span>
                  <span
                    className="text-[11px] font-semibold"
                    style={{ color: cfg.accent }}
                    aria-current="page"
                  >
                    {articleLabel} {articleNumber}
                  </span>
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* ── Desktop: full linear breadcrumb (single row) ─────── */}
      <nav
        className="hidden md:flex items-center gap-1.5 text-sm flex-wrap mb-6"
        aria-label="مسار التنقل"
      >
        {fullPath.map((item, idx) => (
          <span key={item.href} className="flex items-center gap-1.5">
            {idx > 0 && (
              <span
                aria-hidden="true"
                className="text-muted-foreground/30 select-none"
                dir="ltr"
              >
                /
              </span>
            )}
            <Link
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          </span>
        ))}
        {/* Current article */}
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="text-muted-foreground/30 select-none"
            dir="ltr"
          >
            /
          </span>
          <span
            className="font-medium"
            style={{ color: cfg.accent }}
            aria-current="page"
          >
            {articleLabel} {articleNumber}
          </span>
        </span>
      </nav>
    </>
  );
}
