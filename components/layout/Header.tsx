"use client";

import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/features/ThemeToggle";
import { FontSizeControl } from "@/components/features/FontSizeControl";
import { useState } from "react";

interface HeaderProps {
  onMenuToggle?: () => void;
  onSearchOpen?: () => void;
  isSidebarOpen?: boolean;
}

export function Header({ onMenuToggle, onSearchOpen, isSidebarOpen }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-[60px] items-center justify-between px-4">
        {/* Logo and Menu Toggle */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuToggle}
            aria-label={isSidebarOpen ? "إغلاق القائمة" : "فتح القائمة"}
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          
          <a href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">قانون دوكس</span>
          </a>
        </div>

        {/* Search Button */}
        <div className="flex-1 max-w-md mx-4">
          <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground"
            onClick={onSearchOpen}
          >
            <Search className="ml-2 h-4 w-4" />
            <span>بحث في القانون...</span>
            <kbd className="pointer-events-none mr-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <FontSizeControl />
          <div className="w-px h-6 bg-border hidden sm:block" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
