"use client";

import { useTheme as useNextTheme } from "next-themes";
import { useEffect, useState } from "react";
import type { Theme } from "@/lib/types";

export function useTheme() {
  const { theme, setTheme, systemTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get the actual current theme (resolved from system if needed)
  const currentTheme = mounted ? (resolvedTheme as Theme) : "dark";

  // Check if dark mode is active
  const isDark = currentTheme === "dark";

  // Toggle between light and dark
  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  // Set specific theme
  const setSpecificTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return {
    theme: currentTheme,
    setTheme: setSpecificTheme,
    toggleTheme,
    isDark,
    isLight: !isDark,
    systemTheme: systemTheme as Theme | undefined,
    mounted,
  };
}
