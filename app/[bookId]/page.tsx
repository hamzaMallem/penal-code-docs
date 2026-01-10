"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { SearchModal } from "@/components/features/SearchModal";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { ChevronDown, ChevronLeft, FileText, Home } from "lucide-react";

// Generic node interface - treats JSON as pure tree of unknown node types
interface GenericNode {
  name?: string;
  title?: string;
  number?: string;
  paragraphs?: string[];
  // All possible children arrays - checked dynamically
  chapters?: GenericNode[];
  sections?: GenericNode[];
  branches?: GenericNode[];
  articles?: GenericNode[];
  subsections?: GenericNode[];
  [key: string]: unknown; // Allow any other properties
}

// Static imports for all book data files
import book0Data from "@/data/code_procedure_penale/book_0.json";
import book1Data from "@/data/code_procedure_penale/book_1st.json";
import book2Data from "@/data/code_procedure_penale/book_2nd.json";
import book3Data from "@/data/code_procedure_penale/book_3rd.json";
import book4Data from "@/data/code_procedure_penale/book_4th.json";
import book5Data from "@/data/code_procedure_penale/book_5th.json";
import book6Data from "@/data/code_procedure_penale/book_6th.json";
import book7Data from "@/data/code_procedure_penale/book_7th.json";
import book8Data from "@/data/code_procedure_penale/book_8th.json";

// Book data mapping using static imports
const bookDataMap: Record<string, GenericNode> = {
  book_0: book0Data as GenericNode,
  book_1: book1Data as GenericNode,
  book_2: book2Data as GenericNode,
  book_3: book3Data as GenericNode,
  book_4: book4Data as GenericNode,
  book_5: book5Data as GenericNode,
  book_6: book6Data as GenericNode,
  book_7: book7Data as GenericNode,
  book_8: book8Data as GenericNode,
};

// Known children property names in the JSON structure
const CHILDREN_KEYS = ["chapters", "sections", "branches", "articles", "subsections"];

// Get all children arrays from a node (preserving order as they appear)
function getChildrenArrays(node: GenericNode): { key: string; children: GenericNode[] }[] {
  const result: { key: string; children: GenericNode[] }[] = [];
  
  for (const key of CHILDREN_KEYS) {
    const children = node[key] as GenericNode[] | undefined;
    if (children && Array.isArray(children) && children.length > 0) {
      result.push({ key, children });
    }
  }
  
  return result;
}

// Check if a node has any children
function hasChildren(node: GenericNode): boolean {
  return getChildrenArrays(node).length > 0;
}

// Check if a node is navigable (has a number property)
function isNavigable(node: GenericNode): boolean {
  return typeof node.number === "string" && node.number.length > 0;
}

// Find the first article (navigable node) in a tree recursively
function findFirstArticle(node: GenericNode): GenericNode | null {
  // If this node itself is an article, return it
  if (isNavigable(node)) {
    return node;
  }
  
  // Otherwise, search through all children arrays
  const childrenArrays = getChildrenArrays(node);
  for (const { children } of childrenArrays) {
    for (const child of children) {
      const article = findFirstArticle(child);
      if (article) {
        return article;
      }
    }
  }
  
  return null;
}

// Get display label for a node
function getNodeLabel(node: GenericNode): string {
  if (node.name && node.title) {
    return `${node.name}: ${node.title}`;
  }
  if (node.name) {
    return node.name;
  }
  if (node.title) {
    return node.title;
  }
  if (node.number) {
    return `المادة ${node.number}`;
  }
  return "عنصر";
}

// Recursive tree node component - no type assumptions
function TreeNode({
  node,
  bookId,
  depth = 0,
}: {
  node: GenericNode;
  bookId: string;
  depth?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(depth < 2); // Auto-expand first 2 levels
  const childrenArrays = getChildrenArrays(node);
  const nodeHasChildren = childrenArrays.length > 0;
  const nodeIsNavigable = isNavigable(node);
  const label = getNodeLabel(node);

  // Find first article for non-navigable nodes
  const firstArticle = !nodeIsNavigable ? findFirstArticle(node) : null;
  const navigationHref = nodeIsNavigable 
    ? `/${bookId}/${node.number}` 
    : firstArticle 
    ? `/${bookId}/${firstArticle.number}` 
    : undefined;

  // Determine styling based on depth
  const depthStyles = [
    "text-lg font-bold text-primary", // depth 0
    "text-base font-semibold text-foreground", // depth 1
    "text-sm font-medium text-foreground", // depth 2
    "text-sm text-muted-foreground", // depth 3+
  ];
  const textStyle = depthStyles[Math.min(depth, depthStyles.length - 1)];

  // Handle title click for non-navigable nodes with children
  const handleTitleClick = (e: React.MouseEvent) => {
    if (!nodeIsNavigable && nodeHasChildren) {
      // Toggle expansion
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={`${depth > 0 ? "mr-4 border-r border-border pr-4" : ""}`}>
      <div className="flex items-start gap-2 py-2">
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
          <span className="w-6 shrink-0" /> // Spacer for alignment
        )}

        {/* Node content */}
        <div className="flex-1 min-w-0">
          {nodeIsNavigable ? (
            // Navigable node (article) - link to article page
            <Link
              href={`/${bookId}/${node.number}`}
              className={`block hover:text-primary transition-colors ${textStyle}`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-primary" />
                <span>المادة {node.number}</span>
              </div>
              {node.paragraphs && node.paragraphs.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {node.paragraphs[0].substring(0, 100)}...
                </p>
              )}
            </Link>
          ) : navigationHref ? (
            // Non-navigable node with first article found - clickable title
            <Link
              href={navigationHref}
              onClick={handleTitleClick}
              className={`block hover:text-primary transition-colors ${textStyle} cursor-pointer`}
            >
              {label}
            </Link>
          ) : (
            // Non-navigable node without articles - just display label
            <div 
              className={`${textStyle} ${nodeHasChildren ? 'cursor-pointer' : ''}`}
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
              {children.map((child, index) => (
                <TreeNode
                  key={`${key}-${index}-${child.number || child.name || index}`}
                  node={child}
                  bookId={bookId}
                  depth={depth + 1}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BookPage() {
  const params = useParams();
  const bookId = params.bookId as string;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [bookData, setBookData] = useState<GenericNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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

  // Load book data using static imports
  useEffect(() => {
    setLoading(true);
    setError(null);

    const data = bookDataMap[bookId];
    if (!data) {
      setError("الكتاب غير موجود");
      setLoading(false);
      return;
    }

    setBookData(data);
    setLoading(false);
  }, [bookId]);

  // Navigation items for sidebar
  const navItems = [
    { id: "book_0", label: "أحكام تمهيدية", href: "/book_0", children: [] },
    { id: "book_1", label: "الكتاب الأول", href: "/book_1", children: [] },
    { id: "book_2", label: "الكتاب الثاني", href: "/book_2", children: [] },
    { id: "book_3", label: "الكتاب الثالث", href: "/book_3", children: [] },
    { id: "book_4", label: "الكتاب الرابع", href: "/book_4", children: [] },
    { id: "book_5", label: "الكتاب الخامس", href: "/book_5", children: [] },
    { id: "book_6", label: "الكتاب السادس", href: "/book_6", children: [] },
    { id: "book_7", label: "الكتاب السابع", href: "/book_7", children: [] },
    { id: "book_8", label: "الكتاب الثامن", href: "/book_8", children: [] },
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
              <span className="text-foreground">
                {bookData ? getNodeLabel(bookData) : "جاري التحميل..."}
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
                <Link href="/" className="text-primary hover:underline mt-4 inline-block">
                  العودة للرئيسية
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
                    <p className="text-lg text-muted-foreground">{bookData.title}</p>
                  )}
                </div>

                {/* Tree navigator - renders all children recursively */}
                <div className="space-y-2">
                  {getChildrenArrays(bookData).map(({ key, children }) => (
                    <div key={key}>
                      {children.map((child, index) => (
                        <TreeNode
                          key={`${key}-${index}-${child.number || child.name || index}`}
                          node={child}
                          bookId={bookId}
                          depth={0}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <Footer />
        </main>
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onSearch={search} />
    </div>
  );
}
