"use client";

import { Search, Menu, X, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/features/ThemeToggle";
import { FontSizeControl } from "@/components/features/FontSizeControl";
import { useState, useEffect } from "react";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface HeaderContextInfo {
  lawLabel?: string;
  lawHref?: string;
  bookName?: string;
  bookHref?: string;
  articleLabel?: string;
}

interface HeaderProps {
  onMenuToggle?: () => void;
  onSearchOpen?: () => void;
  isSidebarOpen?: boolean;
  contextInfo?: HeaderContextInfo;
}

const MOBILE_BREAKPOINT = 768;

export function Header({
  onMenuToggle,
  onSearchOpen,
  isSidebarOpen,
  contextInfo,
}: HeaderProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const scrollDirection = useScrollDirection({
    threshold: 15,
    disabled: !mounted || !isMobile,
  });

  const shouldHide = mounted && isMobile && scrollDirection === "down";
  const hasContext = !!(contextInfo?.lawLabel || contextInfo?.bookName);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "transition-transform duration-300 ease-out",
        shouldHide && "-translate-y-full"
      )}
    >
      {/* ── Main Bar ─────────────────────────────────────────────────── */}
      <div className="bg-background/90 backdrop-blur-xl border-b border-border/40 supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-16 items-center gap-3 px-4">

          {/* ZONE A — Brand / Hamburger (RTL: visual right / leading edge) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Menu toggle — mobile only */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-10 w-10 rounded-xl hover:bg-accent/60 transition-colors duration-150"
              onClick={onMenuToggle}
              aria-label={isSidebarOpen ? "إغلاق القائمة" : "فتح القائمة"}
            >
              <span className="relative block w-5 h-5">
                <X
                  className={cn(
                    "absolute inset-0 h-5 w-5 transition-all duration-200",
                    isSidebarOpen
                      ? "opacity-100 rotate-0 scale-100"
                      : "opacity-0 rotate-90 scale-75"
                  )}
                />
                <Menu
                  className={cn(
                    "absolute inset-0 h-5 w-5 transition-all duration-200",
                    isSidebarOpen
                      ? "opacity-0 -rotate-90 scale-75"
                      : "opacity-100 rotate-0 scale-100"
                  )}
                />
              </span>
            </Button>

            {/* Home icon — mobile only (icon-only, compact) */}
            <Link
              href="/"
              className="lg:hidden flex items-center justify-center h-10 w-10 rounded-xl hover:bg-accent/60 transition-colors duration-150"
              aria-label="الرئيسية"
            >
              <BookOpen className="h-5 w-5 text-[var(--sg-blue)]" />
            </Link>

            {/* Logo — desktop only */}
            <Link
              href="/"
              className="hidden lg:flex items-center gap-2.5 hover:opacity-75 transition-opacity duration-150"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--sg-blue)]/10 border border-[var(--sg-blue)]/20">
                <BookOpen className="h-4 w-4 text-[var(--sg-blue)]" />
              </div>
              <span className="text-sm font-semibold text-foreground tracking-tight">
                قانونك
              </span>
            </Link>
          </div>

          {/* ZONE B — Search pill (grows, center) */}
          <div className="flex-1 min-w-0">
            <button
              onClick={onSearchOpen}
              aria-label="البحث في القوانين — اضغط للبحث"
              className={cn(
                "w-full flex items-center h-11 px-4 rounded-xl",
                "bg-muted/40 hover:bg-muted/70",
                "border border-border/50 hover:border-border/90",
                "transition-all duration-200",
                "active:scale-[0.99] active:bg-muted/80",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
              )}
            >
              {/* Icon comes FIRST in JSX — renders at visual RIGHT in RTL */}
              <Search className="h-4 w-4 shrink-0 text-muted-foreground me-2.5" />
              <span className="flex-1 text-sm text-muted-foreground truncate text-start">
                <span className="hidden sm:inline">ابحث عن فصل أو مادة...</span>
                <span className="sm:hidden">بحث في القوانين...</span>
              </span>
              {/* ⌘K only on medium+ — never show on touch devices */}
              <kbd
                className="pointer-events-none hidden md:inline-flex items-center h-5 px-1.5 rounded text-[10px] font-medium ms-2 bg-muted border border-border/60 text-muted-foreground"
                style={{ fontFamily: "var(--font-mono, monospace)" }}
              >
                ⌘K
              </kbd>
            </button>
          </div>

          {/* ZONE C — Actions (RTL: visual left / trailing edge) */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Mobile: compact FontSizeControl (Type icon + dropdown only) */}
            <div className="sm:hidden">
              <FontSizeControl compact />
            </div>
            {/* Desktop: full FontSizeControl + divider */}
            <div className="hidden sm:flex items-center gap-1">
              <FontSizeControl />
              <div className="w-px h-5 bg-border/60 mx-0.5" aria-hidden="true" />
            </div>
            <ThemeToggle />
          </div>

        </div>
      </div>

      {/* ── Context Sub-bar (optional — shown when page context is available) ── */}
      {hasContext && (
        <div
          className="bg-background/80 backdrop-blur-xl border-b border-border/20 animate-in slide-in-from-top-1 duration-200"
          aria-label="مسار التنقل السريع"
        >
          <div className="flex items-center h-9 px-4 gap-1.5 overflow-hidden">
            {contextInfo?.lawLabel && (
              <>
                {contextInfo.lawHref ? (
                  <Link
                    href={contextInfo.lawHref}
                    className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors truncate shrink-0 max-w-[140px]"
                  >
                    {contextInfo.lawLabel}
                  </Link>
                ) : (
                  <span className="text-xs text-muted-foreground/60 truncate shrink-0 max-w-[140px]">
                    {contextInfo.lawLabel}
                  </span>
                )}
              </>
            )}

            {contextInfo?.bookName && (
              <>
                <span className="text-muted-foreground/25 text-xs select-none" aria-hidden="true">
                  ›
                </span>
                {contextInfo.bookHref ? (
                  <Link
                    href={contextInfo.bookHref}
                    className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors truncate shrink-0 max-w-[140px]"
                  >
                    {contextInfo.bookName}
                  </Link>
                ) : (
                  <span className="text-xs text-muted-foreground/60 truncate shrink-0 max-w-[140px]">
                    {contextInfo.bookName}
                  </span>
                )}
              </>
            )}

            {contextInfo?.articleLabel && (
              <>
                <span className="text-muted-foreground/25 text-xs select-none" aria-hidden="true">
                  ›
                </span>
                <span className="text-xs text-foreground/75 font-medium truncate">
                  {contextInfo.articleLabel}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
