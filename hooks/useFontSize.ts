"use client";

import { useEffect, useState, useCallback } from "react";
import type { FontSize, FontSizeConfig } from "@/lib/types";

// Font size configurations
// إعدادات أحجام الخط
export const FONT_SIZE_CONFIG: Record<FontSize, FontSizeConfig> = {
  small: {
    label: "صغير",
    value: "14px",
    scale: 0.778,
  },
  medium: {
    label: "متوسط",
    value: "18px",
    scale: 1,
  },
  large: {
    label: "كبير",
    value: "22px",
    scale: 1.222,
  },
  xlarge: {
    label: "كبير جداً",
    value: "26px",
    scale: 1.444,
  },
};

// Font size order for increment/decrement
const FONT_SIZE_ORDER: FontSize[] = ["small", "medium", "large", "xlarge"];

const STORAGE_KEY = "qanun-docs-font-size";
const DEFAULT_FONT_SIZE: FontSize = "medium";

export function useFontSize() {
  const [fontSize, setFontSizeState] = useState<FontSize>(DEFAULT_FONT_SIZE);
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && FONT_SIZE_ORDER.includes(stored as FontSize)) {
      setFontSizeState(stored as FontSize);
    }
  }, []);

  // Apply font size to document
  useEffect(() => {
    if (!mounted) return;

    const config = FONT_SIZE_CONFIG[fontSize];
    
    // Apply CSS custom properties to root (html element)
    document.documentElement.style.setProperty("--font-size-base", config.value);
    document.documentElement.style.setProperty("--font-size-scale", config.scale.toString());
    
    // Also apply directly to body for immediate effect
    document.body.style.fontSize = config.value;
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, fontSize);
  }, [fontSize, mounted]);

  // Set specific font size
  const setFontSize = useCallback((size: FontSize) => {
    setFontSizeState(size);
  }, []);

  // Increase font size
  const increaseFontSize = useCallback(() => {
    setFontSizeState((current) => {
      const currentIndex = FONT_SIZE_ORDER.indexOf(current);
      if (currentIndex < FONT_SIZE_ORDER.length - 1) {
        return FONT_SIZE_ORDER[currentIndex + 1];
      }
      return current;
    });
  }, []);

  // Decrease font size
  const decreaseFontSize = useCallback(() => {
    setFontSizeState((current) => {
      const currentIndex = FONT_SIZE_ORDER.indexOf(current);
      if (currentIndex > 0) {
        return FONT_SIZE_ORDER[currentIndex - 1];
      }
      return current;
    });
  }, []);

  // Reset to default
  const resetFontSize = useCallback(() => {
    setFontSizeState(DEFAULT_FONT_SIZE);
  }, []);

  // Check if can increase/decrease
  const canIncrease = FONT_SIZE_ORDER.indexOf(fontSize) < FONT_SIZE_ORDER.length - 1;
  const canDecrease = FONT_SIZE_ORDER.indexOf(fontSize) > 0;

  return {
    fontSize,
    setFontSize,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    canIncrease,
    canDecrease,
    config: FONT_SIZE_CONFIG[fontSize],
    allSizes: FONT_SIZE_CONFIG,
    mounted,
  };
}
