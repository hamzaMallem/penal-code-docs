"use client";

import { useEffect, useCallback } from "react";
import type { KeyboardShortcut } from "@/lib/types";

interface UseKeyboardNavOptions {
  onSearchOpen?: () => void;
  onPreviousArticle?: () => void;
  onNextArticle?: () => void;
  onEscape?: () => void;
  enabled?: boolean;
}

export function useKeyboardNav({
  onSearchOpen,
  onPreviousArticle,
  onNextArticle,
  onEscape,
  enabled = true,
}: UseKeyboardNavOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Only allow Escape in input fields
        if (event.key === "Escape" && onEscape) {
          onEscape();
        }
        return;
      }

      // Ctrl+K or Cmd+K - Open search
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        onSearchOpen?.();
        return;
      }

      // Arrow Left - Next article (in RTL, left is next)
      if (event.key === "ArrowLeft" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        onNextArticle?.();
        return;
      }

      // Arrow Right - Previous article (in RTL, right is previous)
      if (event.key === "ArrowRight" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        onPreviousArticle?.();
        return;
      }

      // Escape - Close modal or go back
      if (event.key === "Escape") {
        onEscape?.();
        return;
      }
    },
    [enabled, onSearchOpen, onPreviousArticle, onNextArticle, onEscape]
  );

  useEffect(() => {
    if (enabled) {
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [enabled, handleKeyDown]);

  // Return keyboard shortcuts for display
  const shortcuts: KeyboardShortcut[] = [
    {
      key: "k",
      ctrlKey: true,
      action: () => onSearchOpen?.(),
      description: "فتح البحث",
    },
    {
      key: "ArrowLeft",
      action: () => onNextArticle?.(),
      description: "المادة التالية",
    },
    {
      key: "ArrowRight",
      action: () => onPreviousArticle?.(),
      description: "المادة السابقة",
    },
    {
      key: "Escape",
      action: () => onEscape?.(),
      description: "إغلاق",
    },
  ];

  return { shortcuts };
}
