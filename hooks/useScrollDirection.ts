"use client";

import { useState, useEffect, useRef } from "react";

type ScrollDirection = "up" | "down" | null;

interface UseScrollDirectionOptions {
  threshold?: number; // Minimum scroll distance to trigger direction change
  disabled?: boolean; // Disable the hook (e.g., on desktop)
}

/**
 * Hook to detect scroll direction
 * Used for smart header hide/show on mobile
 * 
 * @param options - Configuration options
 * @returns Current scroll direction ("up" | "down" | null)
 */
export function useScrollDirection({
  threshold = 10,
  disabled = false,
}: UseScrollDirectionOptions = {}): ScrollDirection {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    if (disabled) {
      setScrollDirection(null);
      return;
    }

    // Initialize last scroll position
    lastScrollY.current = window.scrollY;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      const diff = scrollY - lastScrollY.current;

      // Only update if scroll distance exceeds threshold
      if (Math.abs(diff) >= threshold) {
        const newDirection = diff > 0 ? "down" : "up";
        setScrollDirection(newDirection);
        lastScrollY.current = scrollY;
      }

      // At top of page, always show header
      if (scrollY <= 0) {
        setScrollDirection("up");
      }

      ticking.current = false;
    };

    const handleScroll = () => {
      if (!ticking.current) {
        // Use requestAnimationFrame for performance
        window.requestAnimationFrame(updateScrollDirection);
        ticking.current = true;
      }
    };

    // Use passive listener for better scroll performance
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold, disabled]);

  return scrollDirection;
}
