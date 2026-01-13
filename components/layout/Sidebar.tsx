"use client";

import { ChevronDown, ChevronLeft, Book, X, Minus, Plus, RotateCcw, Type } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback, useRef } from "react";
import type { NavItem } from "@/lib/types";
import { getLawSource } from "@/lib/law-sources";
import { useFontSize } from "@/hooks/useFontSize";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  navItems?: NavItem[];
  activeItemId?: string;
  lawKey?: string;
}

interface NavItemComponentProps {
  item: NavItem;
  level?: number;
  activeItemId?: string;
  onLinkClick?: () => void;
}

// DevDocs-style navigation item with improved RTL Arabic text handling
function NavItemComponent({ item, level = 0, activeItemId, onLinkClick }: NavItemComponentProps) {
  const [isExpanded, setIsExpanded] = useState(item.isExpanded ?? level === 0);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.id === activeItemId;

  // Book level (level 0) - main navigation items
  if (level === 0) {
    return (
      <div className="mb-2">
        <a
          href={item.href}
          className={cn(
            "group flex items-start gap-3 py-3 px-4 transition-colors rounded-md",
            "hover:bg-accent/50",
            "font-semibold text-foreground",
            isActive && "bg-accent text-accent-foreground"
          )}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            } else {
              onLinkClick?.();
            }
          }}
        >
          {/* Icon - aligned to top for multi-line text */}
          <Book className="h-5 w-5 shrink-0 text-primary mt-0.5" />
          
          {/* Title - allows wrapping, max 2 lines with ellipsis */}
          <span 
            className="flex-1 text-right leading-relaxed"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              wordBreak: 'break-word',
              lineHeight: '1.6',
            }}
          >
            {item.label}
          </span>
          
          {/* Expand/collapse icon */}
          {hasChildren && (
            <span className="shrink-0 text-muted-foreground mt-0.5">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </span>
          )}
        </a>
        
        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-1 mr-4 pr-3 border-r-2 border-border/50">
            {item.children!.map((child) => (
              <NavItemComponent
                key={child.id}
                item={child}
                level={level + 1}
                activeItemId={activeItemId}
                onLinkClick={onLinkClick}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Section/Chapter level (level > 0) - nested items
  return (
    <div className="mb-1">
      <a
        href={item.href}
        className={cn(
          "group flex items-start gap-2 py-2 px-3 transition-colors rounded-sm",
          "hover:bg-accent/30",
          "text-muted-foreground hover:text-foreground",
          isActive && "bg-accent/50 text-foreground font-medium"
        )}
        style={{ 
          marginRight: level > 1 ? `${(level - 1) * 12}px` : undefined 
        }}
        onClick={(e) => {
          if (hasChildren) {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          } else {
            onLinkClick?.();
          }
        }}
      >
        {/* Bullet point - aligned to top */}
        <span className="w-2 h-2 shrink-0 rounded-full bg-border mt-2" />
        
        {/* Title - allows wrapping, max 2 lines */}
        <span 
          className="flex-1 text-right text-sm leading-relaxed"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            wordBreak: 'break-word',
            lineHeight: '1.5',
          }}
        >
          {item.label}
        </span>
        
        {/* Expand/collapse icon for nested items */}
        {hasChildren && (
          <span className="shrink-0 text-muted-foreground mt-1">
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </span>
        )}
      </a>
      
      {/* Nested children */}
      {hasChildren && isExpanded && (
        <div className="mt-0.5">
          {item.children!.map((child) => (
            <NavItemComponent
              key={child.id}
              item={child}
              level={level + 1}
              activeItemId={activeItemId}
              onLinkClick={onLinkClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Constants for resize behavior
const MIN_WIDTH = 220;
const MAX_WIDTH = 420;
const DEFAULT_WIDTH = 280;
const DESKTOP_BREAKPOINT = 1024;
const STORAGE_KEY = "qanun-sidebar-width";

/**
 * Reading Settings Component for Mobile Drawer
 * إعدادات القراءة للقائمة الجانبية على الجوال
 * 
 * Features:
 * - Large touch targets (48px min height)
 * - RTL-aligned
 * - Clear Arabic labels
 * - Reuses existing useFontSize hook
 */
function ReadingSettings() {
  const {
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    canIncrease,
    canDecrease,
    config,
    mounted,
  } = useFontSize();

  // Avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2 mb-3">
          <Type className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">إعدادات القراءة</span>
        </div>
        <div className="flex items-center justify-between gap-2 opacity-50">
          <div className="h-12 flex-1 bg-muted rounded-lg animate-pulse" />
          <div className="h-12 flex-1 bg-muted rounded-lg animate-pulse" />
          <div className="h-12 flex-1 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-t border-border">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-3">
        <Type className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">إعدادات القراءة</span>
      </div>

      {/* Current Size Indicator */}
      <div className="text-xs text-muted-foreground mb-3 text-center">
        حجم الخط: <span className="text-foreground font-medium">{config.label}</span> ({config.value})
      </div>

      {/* Font Size Controls - Large Touch Targets */}
      <div className="flex items-center justify-between gap-2">
        {/* Decrease Button */}
        <Button
          variant="outline"
          onClick={decreaseFontSize}
          disabled={!canDecrease}
          className={cn(
            "flex-1 min-h-[48px] flex flex-col items-center justify-center gap-1",
            "transition-colors duration-150"
          )}
          aria-label="تصغير الخط"
        >
          <Minus className="h-5 w-5" />
          <span className="text-xs">تصغير</span>
        </Button>

        {/* Reset Button */}
        <Button
          variant="outline"
          onClick={resetFontSize}
          className={cn(
            "flex-1 min-h-[48px] flex flex-col items-center justify-center gap-1",
            "transition-colors duration-150"
          )}
          aria-label="إعادة تعيين حجم الخط"
        >
          <RotateCcw className="h-5 w-5" />
          <span className="text-xs">افتراضي</span>
        </Button>

        {/* Increase Button */}
        <Button
          variant="outline"
          onClick={increaseFontSize}
          disabled={!canIncrease}
          className={cn(
            "flex-1 min-h-[48px] flex flex-col items-center justify-center gap-1",
            "transition-colors duration-150"
          )}
          aria-label="تكبير الخط"
        >
          <Plus className="h-5 w-5" />
          <span className="text-xs">تكبير</span>
        </Button>
      </div>
    </div>
  );
}

/**
 * Sidebar Content - shared between Desktop and Mobile
 * محتوى الشريط الجانبي - مشترك بين سطح المكتب والجوال
 */
function SidebarContent({
  navItems,
  activeItemId,
  lawKey,
  width,
  isDesktop,
  onLinkClick,
}: {
  navItems: NavItem[];
  activeItemId?: string;
  lawKey?: string;
  width: number;
  isDesktop: boolean;
  onLinkClick?: () => void;
}) {
  return (
    <ScrollArea className="h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground truncate">
            {lawKey ? getLawSource(lawKey)?.label || "القوانين" : "القوانين"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {lawKey && getLawSource(lawKey)?.description
              ? getLawSource(lawKey)!.description
              : "منصة القوانين المغربية"}
          </p>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="p-2">
        {navItems.length > 0 ? (
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <NavItemComponent
                key={item.id}
                item={item}
                activeItemId={activeItemId}
                onLinkClick={onLinkClick}
              />
            ))}
          </div>
        ) : (
          <div className="px-3 py-8 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              جاري تحميل القائمة...
            </p>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-border px-4 py-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{navItems.length} كتاب</span>
          {isDesktop && <span className="opacity-50">{width}px</span>}
        </div>
      </div>
    </ScrollArea>
  );
}

/**
 * Mobile Drawer Sidebar
 * الشريط الجانبي للجوال (درج)
 * 
 * OVERFLOW FIX:
 * - Container has overflow-hidden to prevent translate-x-full from causing horizontal scroll
 * - Drawer uses inset-0 + translate instead of right-0 positioning
 */
function MobileSidebar({
  isOpen,
  onClose,
  navItems,
  activeItemId,
  lawKey,
}: {
  isOpen: boolean;
  onClose?: () => void;
  navItems: NavItem[];
  activeItemId?: string;
  lawKey?: string;
}) {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay - covers entire screen */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 
        Drawer Container - CRITICAL for preventing horizontal overflow
        This wrapper clips the drawer when it's translated off-screen
      */}
      <div 
        className="fixed inset-0 z-50 overflow-hidden pointer-events-none"
        aria-hidden={!isOpen}
      >
        {/* Drawer - slides from RIGHT (RTL) */}
        <aside
          className={cn(
            // Position at right edge, full height
            "absolute top-0 right-0 h-full w-full max-w-sm",
            "bg-background border-l border-border shadow-xl",
            // Smooth slide animation
            "transition-transform duration-300 ease-out",
            // Enable pointer events only when open
            isOpen ? "translate-x-0 pointer-events-auto" : "translate-x-full"
          )}
          role="dialog"
          aria-modal="true"
          aria-label="القائمة الجانبية"
        >
          {/* Close button */}
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-muted hover:bg-accent transition-colors"
              aria-label="إغلاق القائمة"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer content with top padding for close button */}
          <div className="h-full pt-16 flex flex-col">
            {/* Reading Settings - Mobile Only */}
            <ReadingSettings />
            
            {/* Navigation Content */}
            <div className="flex-1 min-h-0">
              <SidebarContent
                navItems={navItems}
                activeItemId={activeItemId}
                lawKey={lawKey}
                width={DEFAULT_WIDTH}
                isDesktop={false}
                onLinkClick={onClose}
              />
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

/**
 * Desktop Sidebar with resizable splitter
 * الشريط الجانبي لسطح المكتب مع إمكانية تغيير الحجم
 */
function DesktopSidebar({
  navItems,
  activeItemId,
  lawKey,
}: {
  navItems: NavItem[];
  activeItemId?: string;
  lawKey?: string;
}) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(DEFAULT_WIDTH);

  // Load saved width on mount
  useEffect(() => {
    const savedWidth = localStorage.getItem(STORAGE_KEY);
    if (savedWidth) {
      const parsedWidth = parseInt(savedWidth, 10);
      if (parsedWidth >= MIN_WIDTH && parsedWidth <= MAX_WIDTH) {
        setWidth(parsedWidth);
      }
    }
  }, []);

  // Save width to localStorage
  const saveWidth = useCallback((newWidth: number) => {
    localStorage.setItem(STORAGE_KEY, String(newWidth));
  }, []);

  // Handle mouse down on splitter - START DRAG
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    setIsResizing(true);
  }, [width]);

  // Handle mouse move and mouse up - DRAG & END
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      
      // RTL: drag LEFT = decrease width, drag RIGHT = increase width
      const deltaX = e.clientX - startXRef.current;
      
      // In RTL, moving mouse to the right (positive deltaX) should DECREASE sidebar width
      const newWidth = startWidthRef.current - deltaX;
      
      // Clamp to min/max
      const clampedWidth = Math.min(Math.max(newWidth, MIN_WIDTH), MAX_WIDTH);
      setWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      saveWidth(width);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, width, saveWidth]);

  // Double-click to reset width
  const handleDoubleClick = useCallback(() => {
    setWidth(DEFAULT_WIDTH);
    saveWidth(DEFAULT_WIDTH);
  }, [saveWidth]);

  return (
    <>
      {/* Splitter - positioned at the left edge of sidebar */}
      <div
        className={cn(
          "fixed top-[60px] z-50 h-[calc(100vh-60px)] w-[6px] cursor-col-resize",
          "flex items-center justify-center",
          "hover:bg-primary/20 active:bg-primary/30",
          "transition-colors duration-100",
          isResizing && "bg-primary/30"
        )}
        style={{ right: `${width}px` }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        title="اسحب لتغيير العرض، انقر مرتين للإعادة"
      >
        <div 
          className={cn(
            "w-[2px] h-8 rounded-full transition-all duration-100",
            "bg-border",
            isResizing && "h-16 bg-primary"
          )}
        />
      </div>
      
      {/* Sidebar */}
      <aside
        className="fixed top-[60px] right-0 z-40 h-[calc(100vh-60px)] bg-background border-l border-border"
        style={{ 
          width: `${width}px`,
          transition: isResizing ? 'none' : 'width 0.15s ease-out'
        }}
      >
        <SidebarContent
          navItems={navItems}
          activeItemId={activeItemId}
          lawKey={lawKey}
          width={width}
          isDesktop={true}
        />
      </aside>

      {/* CSS variable for main content margin */}
      <style>{`
        :root {
          --sidebar-width: ${width}px;
        }
      `}</style>
    </>
  );
}

/**
 * Main Sidebar Component
 * المكون الرئيسي للشريط الجانبي
 * 
 * - Desktop (>= 1024px): Static sidebar with resizable splitter
 * - Mobile (< 1024px): Full-height drawer from right (RTL)
 * 
 * HYDRATION SAFETY:
 * - Renders nothing during SSR (mounted = false)
 * - Only determines viewport after client mount
 * - No window/document access during render phase
 */
export function Sidebar({ isOpen = true, onClose, navItems = [], activeItemId, lawKey }: SidebarProps) {
  // State: null = not yet determined (SSR/initial), true = desktop, false = mobile
  const [viewportState, setViewportState] = useState<'loading' | 'mobile' | 'desktop'>('loading');

  // Single useEffect for mount + viewport detection
  // This ensures NO rendering happens until we know the viewport
  useEffect(() => {
    // Determine viewport on mount
    const checkViewport = () => {
      const isDesktopViewport = window.innerWidth >= DESKTOP_BREAKPOINT;
      setViewportState(isDesktopViewport ? 'desktop' : 'mobile');
    };

    // Initial check
    checkViewport();

    // Listen for resize
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  // CRITICAL: Render nothing until viewport is determined
  // This prevents ANY hydration mismatch since SSR output = null, client initial = null
  if (viewportState === 'loading') {
    return null;
  }

  // Mobile: Full-screen drawer
  if (viewportState === 'mobile') {
    return (
      <MobileSidebar
        isOpen={isOpen}
        onClose={onClose}
        navItems={navItems}
        activeItemId={activeItemId}
        lawKey={lawKey}
      />
    );
  }

  // Desktop: Static sidebar with resizer
  return (
    <DesktopSidebar
      navItems={navItems}
      activeItemId={activeItemId}
      lawKey={lawKey}
    />
  );
}
