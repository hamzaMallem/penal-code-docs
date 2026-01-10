"use client";

import * as React from "react";
import { Minus, Plus, Type, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFontSize, FONT_SIZE_CONFIG } from "@/hooks/useFontSize";
import type { FontSize } from "@/lib/types";

export function FontSizeControl() {
  const {
    fontSize,
    setFontSize,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    canIncrease,
    canDecrease,
    config,
    mounted,
  } = useFontSize();

  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setShowDropdown(false);
    }
  };

  // Avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" disabled className="h-9 w-9">
          <Minus className="h-4 w-4" />
          <span className="sr-only">تصغير الخط</span>
        </Button>
        <Button variant="ghost" size="icon" disabled className="h-9 w-9">
          <Type className="h-4 w-4" />
          <span className="sr-only">حجم الخط</span>
        </Button>
        <Button variant="ghost" size="icon" disabled className="h-9 w-9">
          <Plus className="h-4 w-4" />
          <span className="sr-only">تكبير الخط</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-1" ref={dropdownRef} onKeyDown={handleKeyDown}>
      {/* Decrease Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={decreaseFontSize}
        disabled={!canDecrease}
        className="h-9 w-9"
        aria-label="تصغير الخط"
        title="تصغير الخط"
      >
        <Minus className="h-4 w-4" />
      </Button>

      {/* Font Size Indicator / Dropdown Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowDropdown(!showDropdown)}
        className="h-9 w-9 relative"
        aria-label={`حجم الخط: ${config.label}`}
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
        title={`حجم الخط: ${config.label}`}
      >
        <Type className="h-4 w-4" />
        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-primary">
          {fontSize === "small" ? "ص" : fontSize === "medium" ? "م" : fontSize === "large" ? "ك" : "ج"}
        </span>
      </Button>

      {/* Increase Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={increaseFontSize}
        disabled={!canIncrease}
        className="h-9 w-9"
        aria-label="تكبير الخط"
        title="تكبير الخط"
      >
        <Plus className="h-4 w-4" />
      </Button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div
          className="absolute top-full left-0 mt-2 w-40 bg-popover border border-border rounded-lg shadow-lg z-50 animate-fade-in"
          role="listbox"
          aria-label="اختر حجم الخط"
        >
          <div className="p-2 space-y-1">
            {(Object.entries(FONT_SIZE_CONFIG) as [FontSize, typeof config][]).map(([key, sizeConfig]) => (
              <button
                key={key}
                onClick={() => {
                  setFontSize(key);
                  setShowDropdown(false);
                }}
                className={`w-full text-start px-3 py-2 rounded-md text-sm transition-colors ${
                  fontSize === key
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
                role="option"
                aria-selected={fontSize === key}
              >
                <span className="flex items-center justify-between">
                  <span>{sizeConfig.label}</span>
                  <span className="text-xs opacity-70">{sizeConfig.value}</span>
                </span>
              </button>
            ))}
            
            {/* Reset Button */}
            <div className="border-t border-border mt-2 pt-2">
              <button
                onClick={() => {
                  resetFontSize();
                  setShowDropdown(false);
                }}
                className="w-full text-start px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
              >
                <RotateCcw className="h-3 w-3" />
                <span>إعادة تعيين</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
