"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { SearchModal } from "@/components/features/SearchModal";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { ChevronDown, ChevronLeft, FileText, Home } from "lucide-react";
import {
  loadBookData,
  findFirstArticle,
  getChildrenArrays,
  isNavigable,
  getNodeLabel,
  parseNodePath,
  type GenericNode,
} from "@/lib/data-loader";
import { getLawSource, getArticleLabel } from "@/lib/law-sources";

/**
 * Context for managing expanded state from URL params
 * سياق لإدارة حالة التوسيع من معلمات URL
 */
interface ExpandContext {
  targetPath: number[];
  expandedPaths: Set<string>;
  highlightPath: string | null;
}

/**
 * Check if a path should be expanded based on target path
 * التحقق مما إذا كان يجب توسيع المسار بناءً على المسار المستهدف
 */
function shouldExpandPath(currentPath: number[], targetPath: number[]): boolean {
  if (targetPath.length === 0) return false;
  
  // Expand if current path is a prefix of target path
  for (let i = 0; i < currentPath.length; i++) {
    if (i >= targetPath.length || currentPath[i] !== targetPath[i]) {
      return false;
    }
  }
  return true;
}

/**
 * Check if a path matches the target exactly (for highlighting)
 * التحقق مما إذا كان المسار يطابق الهدف تمامًا (للتمييز)
 */
function isTargetPath(currentPath: number[], targetPath: number[]): boolean {
  if (currentPath.length !== targetPath.length) return false;
  return currentPath.every((val, idx) => val === targetPath[idx]);
}

/**
 * Generate path key for tracking expanded state
 * توليد مفتاح المسار لتتبع حالة التوسيع
 */
function pathToKey(path: number[]): string {
  return path.join("-");
}

// Recursive tree node component
function TreeNode({
  node,
  lawKey,
  bookId,
  depth = 0,
  currentPath = [],
  expandContext,
  onNodeRef,
}: {
  node: GenericNode;
  lawKey: string;
  bookId: string;
  depth?: number;
  currentPath?: number[];
  expandContext: ExpandContext;
  onNodeRef?: (path: string, element: HTMLDivElement | null) => void;
}) {
  const pathKey = pathToKey(currentPath);
  const isTarget = isTargetPath(currentPath, expandContext.targetPath);
  const shouldAutoExpand = shouldExpandPath(currentPath, expandContext.targetPath);
  
  // Initialize expanded state based on depth or URL params
  const [isExpanded, setIsExpanded] = useState(() => {
    if (shouldAutoExpand) return true;
    return depth < 2;
  });

  // Update expanded state when URL params change
  useEffect(() => {
    if (shouldAutoExpand) {
      setIsExpanded(true);
    }
  }, [shouldAutoExpand]);

  const childrenArrays = getChildrenArrays(node);
  const nodeHasChildren = childrenArrays.length > 0;
  const nodeIsNavigable = isNavigable(node);
  const label = getNodeLabel(node, lawKey);
  const articleLabel = getArticleLabel(lawKey);

  // Find first article for non-navigable nodes
  const firstArticle = !nodeIsNavigable ? findFirstArticle(node) : null;
  const navigationHref = nodeIsNavigable
    ? `/${lawKey}/${bookId}/${node.number}`
    : firstArticle
    ? `/${lawKey}/${bookId}/${firstArticle.number}`
    : undefined;

  // Determine styling based on depth
  const depthStyles = [
    "text-lg font-bold text-primary",
    "text-base font-semibold text-foreground",
    "text-sm font-medium text-foreground",
    "text-sm text-muted-foreground",
  ];
  const textStyle = depthStyles[Math.min(depth, depthStyles.length - 1)];

  // Highlight style for target node
  const highlightStyle = isTarget
    ? "bg-primary/10 border-r-2 border-primary rounded-sm px-2 -mx-2 animate-pulse"
    : "";

  // Handle title click for non-navigable nodes with children
  const handleTitleClick = () => {
    if (!nodeIsNavigable && nodeHasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  // Ref callback for scroll-into-view
  const nodeRef = useCallback(
    (element: HTMLDivElement | null) => {
      if (onNodeRef && isTarget) {
        onNodeRef(pathKey, element);
      }
    },
    [onNodeRef, isTarget, pathKey]
  );

  // Track child index for building paths
  let childFlatIndex = 0;

  return (
    <div
      ref={nodeRef}
      className={`${depth > 0 ? "mr-4 border-r border-border pr-4" : ""}`}
    >
      <div className={`flex items-start gap-2 py-2 ${highlightStyle}`}>
        {/* Expand/collapse button if has children */}
        {nodeHasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 p-1 hover:bg-accent rounded shrink-0"
            aria-label={isExpanded ? "طي" : "توسيع"}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className="w-6 shrink-0" />
        )}

        {/* Node content */}
        <div className="flex-1 min-w-0">
          {nodeIsNavigable ? (
            // Navigable node (article) - link to article page
            <Link
              href={`/${lawKey}/${bookId}/${node.number}`}
              className={`block hover:text-primary transition-colors ${textStyle}`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-primary" />
                <span>{articleLabel} {node.number}</span>
              </div>
              {node.paragraphs && node.paragraphs.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {node.paragraphs[0].substring(0, 100)}...
                </p>
              )}
            </Link>
          ) : navigationHref ? (
            // Non-navigable node with first article found - clickable title
            <button
              onClick={handleTitleClick}
              className={`block text-right hover:text-primary transition-colors ${textStyle} cursor-pointer w-full`}
            >
              {label}
            </button>
          ) : (
            // Non-navigable node without articles - just display label
            <div
              className={`${textStyle} ${nodeHasChildren ? "cursor-pointer" : ""}`}
              onClick={handleTitleClick}
            >
              {label}
            </div>
          )}
        </div>
      </div>

      {/* Render children recursively if expanded */}
      {isExpanded && nodeHasChildren && (
        <div className="mt-1">
          {childrenArrays.map(({ key, children }) => (
            <div key={key}>
              {children.map((child, index) => {
                const childPath = [...currentPath, childFlatIndex];
                childFlatIndex++;
                return (
                  <TreeNode
                    key={`${key}-${index}-${child.number || child.name || index}`}
                    node={child}
                    lawKey={lawKey}
                    bookId={bookId}
                    depth={depth + 1}
                    currentPath={childPath}
                    expandContext={expandContext}
                    onNodeRef={onNodeRef}
                  />
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BookPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const lawKey = params.lawKey as string;
  const bookId = params.bookId as string;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [bookData, setBookData] = useState<GenericNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Ref map for scroll-into-view
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const hasScrolled = useRef(false);

  // Parse expand parameter from URL
  const expandParam = searchParams.get("expand");
  const targetPath = expandParam ? parseNodePath(expandParam) : [];

  // Build expand context
  const expandContext: ExpandContext = {
    targetPath,
    expandedPaths: new Set(),
    highlightPath: targetPath.length > 0 ? pathToKey(targetPath) : null,
  };

  // Global search
  const { search } = useGlobalSearch();

  // Keyboard navigation
  useKeyboardNav({
    onSearchOpen: () => setIsSearchOpen(true),
    onEscape: () => {
      setIsSearchOpen(false);
      setIsSidebarOpen(false);
    },
  });

  // Handle node ref registration for scroll-into-view
  const handleNodeRef = useCallback((path: string, element: HTMLDivElement | null) => {
    if (element) {
      nodeRefs.current.set(path, element);
    } else {
      nodeRefs.current.delete(path);
    }
  }, []);

  // Scroll to target node after render
  useEffect(() => {
    if (targetPath.length > 0 && !hasScrolled.current && !loading) {
      const targetKey = pathToKey(targetPath);
      
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        const element = nodeRefs.current.get(targetKey);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          hasScrolled.current = true;
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [targetPath, loading]);

  // Reset scroll flag when URL changes
  useEffect(() => {
    hasScrolled.current = false;
  }, [expandParam]);

  // Load book data
  useEffect(() => {
    setLoading(true);
    setError(null);

    loadBookData(lawKey, bookId)
      .then((data) => {
        if (!data) {
          setError("الكتاب غير موجود");
          setLoading(false);
          return;
        }

        setBookData(data);
        setLoading(false);
        
        // NOTE: No auto-redirect - this page is a standalone view
        // Users can browse the book structure and click on articles
      })
      .catch((err) => {
        console.error("Error loading book:", err);
        setError("حدث خطأ أثناء تحميل الكتاب");
        setLoading(false);
      });
  }, [lawKey, bookId]);

  // Get law source info
  const lawSource = getLawSource(lawKey);

  // Navigation items for sidebar
  const navItems = [
    {
      id: "cpp",
      label: "قانون المسطرة الجنائية",
      href: "/cpp",
      children: [],
    },
    {
      id: "dp",
      label: "القانون الجنائي",
      href: "/dp",
      children: [],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onSearchOpen={() => setIsSearchOpen(true)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          navItems={navItems}
          lawKey={lawKey}
        />

        <main className="flex-1 sidebar-margin">
          <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link href="/" className="hover:text-primary flex items-center gap-1">
                <Home className="h-4 w-4" />
                <span>الرئيسية</span>
              </Link>
              <ChevronLeft className="h-4 w-4" />
              {lawSource && (
                <Link href={`/${lawKey}`} className="hover:text-primary">
                  {lawSource.label}
                </Link>
              )}
              <ChevronLeft className="h-4 w-4" />
              <span className="text-foreground">
                {bookData ? getNodeLabel(bookData, lawKey) : "جاري التحميل..."}
              </span>
            </nav>

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive text-lg">{error}</p>
                <Link
                  href={`/${lawKey}`}
                  className="text-primary hover:underline mt-4 inline-block"
                >
                  العودة للقانون
                </Link>
              </div>
            ) : bookData ? (
              <div className="bg-card rounded-lg border border-border p-6">
                {/* Book header */}
                <div className="mb-8 pb-6 border-b border-border">
                  <h1 className="text-2xl font-bold text-primary mb-2">
                    {bookData.name || "الكتاب"}
                  </h1>
                  {bookData.title && (
                    <p className="text-lg text-muted-foreground">
                      {bookData.title}
                    </p>
                  )}
                </div>

                {/* Tree navigator - renders all children recursively */}
                <div className="space-y-2">
                  {(() => {
                    let flatIndex = 0;
                    return getChildrenArrays(bookData).map(({ key, children }) => (
                      <div key={key}>
                        {children.map((child, index) => {
                          const childPath = [flatIndex];
                          flatIndex++;
                          return (
                            <TreeNode
                              key={`${key}-${index}-${child.number || child.name || index}`}
                              node={child}
                              lawKey={lawKey}
                              bookId={bookId}
                              depth={0}
                              currentPath={childPath}
                              expandContext={expandContext}
                              onNodeRef={handleNodeRef}
                            />
                          );
                        })}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            ) : null}
          </div>

          <Footer />
        </main>
      </div>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={search}
      />
    </div>
  );
}
