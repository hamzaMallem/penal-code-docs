"use client";

import { ChevronDown, ChevronLeft, Book } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback, useRef } from "react";
import type { NavItem } from "@/lib/types";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  navItems?: NavItem[];
  activeItemId?: string;
}

interface NavItemComponentProps {
  item: NavItem;
  level?: number;
  activeItemId?: string;
}

// DevDocs-style navigation item with improved RTL Arabic text handling
function NavItemComponent({ item, level = 0, activeItemId }: NavItemComponentProps) {
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

export function Sidebar({ isOpen = true, onClose, navItems = [], activeItemId }: SidebarProps) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [mounted, setMounted] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(DEFAULT_WIDTH);

  // Mount check for hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if we're on desktop (client-side only)
  useEffect(() => {
    if (!mounted) return;

    const checkDesktop = () => {
      const desktop = window.innerWidth >= DESKTOP_BREAKPOINT;
      setIsDesktop(desktop);
      
      // Only load saved width on desktop
      if (desktop) {
        const savedWidth = localStorage.getItem(STORAGE_KEY);
        if (savedWidth) {
          const parsedWidth = parseInt(savedWidth, 10);
          if (parsedWidth >= MIN_WIDTH && parsedWidth <= MAX_WIDTH) {
            setWidth(parsedWidth);
          }
        }
      }
    };

    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, [mounted]);

  // Save width to localStorage
  const saveWidth = useCallback((newWidth: number) => {
    localStorage.setItem(STORAGE_KEY, String(newWidth));
  }, []);

  // Handle mouse down on splitter - START DRAG
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isDesktop) return;
    e.preventDefault();
    e.stopPropagation();
    
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    setIsResizing(true);
  }, [isDesktop, width]);

  // Handle mouse move and mouse up - DRAG & END
  useEffect(() => {
    if (!isResizing || !isDesktop) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      
      // RTL: drag LEFT = decrease width, drag RIGHT = increase width
      // deltaX positive = moved right = increase width
      // deltaX negative = moved left = decrease width
      const deltaX = e.clientX - startXRef.current;
      
      // In RTL, moving mouse to the right (positive deltaX) should DECREASE sidebar width
      // because the splitter is on the LEFT side of the sidebar
      const newWidth = startWidthRef.current - deltaX;
      
      // Clamp to min/max
      const clampedWidth = Math.min(Math.max(newWidth, MIN_WIDTH), MAX_WIDTH);
      setWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      saveWidth(width);
    };

    // Attach to window for smooth dragging even outside the element
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    
    // Set cursor and prevent text selection during drag
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    // Don't disable pointer events - it breaks the drag

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, isDesktop, width, saveWidth]);

  // Double-click to reset width
  const handleDoubleClick = useCallback(() => {
    if (!isDesktop) return;
    setWidth(DEFAULT_WIDTH);
    saveWidth(DEFAULT_WIDTH);
  }, [isDesktop, saveWidth]);

  // Calculate sidebar width
  const sidebarWidth = isDesktop ? width : DEFAULT_WIDTH;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && !isDesktop && mounted && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Desktop Splitter - SEPARATE DOM ELEMENT between content and sidebar */}
      {mounted && isDesktop && (
        <div
          className={cn(
            "fixed top-[60px] z-50 h-[calc(100vh-60px)] w-[6px] cursor-col-resize",
            "flex items-center justify-center",
            "hover:bg-primary/20 active:bg-primary/30",
            "transition-colors duration-100",
            isResizing && "bg-primary/30"
          )}
          style={{ 
            right: `${sidebarWidth}px`,
          }}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          title="اسحب لتغيير العرض، انقر مرتين للإعادة"
        >
          {/* Visual splitter line */}
          <div 
            className={cn(
              "w-[2px] h-8 rounded-full transition-all duration-100",
              "bg-border",
              "group-hover:h-16 group-hover:bg-primary/50",
              isResizing && "h-16 bg-primary"
            )}
          />
        </div>
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-[60px] right-0 z-40 h-[calc(100vh-60px)] bg-background border-l border-border",
          // Mobile: slide in/out
          !isDesktop && "transition-transform duration-300",
          !isDesktop && (isOpen ? "translate-x-0" : "translate-x-full"),
          // Desktop: always visible
          isDesktop && "translate-x-0"
        )}
        style={{ 
          width: `${sidebarWidth}px`,
          // Disable transition during resize for smooth dragging
          transition: isResizing ? 'none' : undefined
        }}
      >
        <ScrollArea className="h-full">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
            <div className="px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground truncate">
                قانون المسطرة الجنائية
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                القانون رقم 22.01
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
              {mounted && isDesktop && <span className="opacity-50">{sidebarWidth}px</span>}
            </div>
          </div>
        </ScrollArea>
      </aside>

      {/* CSS variable for main content margin */}
      {mounted && (
        <style>{`
          :root {
            --sidebar-width: ${isDesktop ? sidebarWidth : 0}px;
          }
        `}</style>
      )}
    </>
  );
}
