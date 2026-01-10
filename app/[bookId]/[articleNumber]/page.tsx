"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { SearchModal } from "@/components/features/SearchModal";
import { ArticleView } from "@/components/features/ArticleView";
import { ArticleNav } from "@/components/features/ArticleNav";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { ChevronLeft, Home, ChevronDown, FileText } from "lucide-react";

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
  [key: string]: unknown;
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

// Known children property names
const CHILDREN_KEYS = ["chapters", "sections", "branches", "articles", "subsections"];

// Get all children arrays from a node
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

// Recursively find a node by its number and collect path info
interface FindResult {
  node: GenericNode;
  path: GenericNode[]; // Ancestors from root to parent
}

function findNodeByNumber(
  root: GenericNode,
  targetNumber: string,
  path: GenericNode[] = []
): FindResult | null {
  // Check if current node matches
  if (root.number === targetNumber) {
    return { node: root, path };
  }

  // Search in all children arrays
  const childrenArrays = getChildrenArrays(root);
  for (const { children } of childrenArrays) {
    for (const child of children) {
      const result = findNodeByNumber(child, targetNumber, [...path, root]);
      if (result) {
        return result;
      }
    }
  }

  return null;
}

// Collect all navigable nodes (nodes with number) in order
function collectNavigableNodes(node: GenericNode, result: GenericNode[] = []): GenericNode[] {
  if (isNavigable(node)) {
    result.push(node);
  }

  const childrenArrays = getChildrenArrays(node);
  for (const { children } of childrenArrays) {
    for (const child of children) {
      collectNavigableNodes(child, result);
    }
  }

  return result;
}

// Tree node component for rendering children of an article
function ChildTreeNode({
  node,
  bookId,
  depth = 0,
}: {
  node: GenericNode;
  bookId: string;
  depth?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const childrenArrays = getChildrenArrays(node);
  const nodeHasChildren = childrenArrays.length > 0;
  const nodeIsNavigable = isNavigable(node);
  const label = getNodeLabel(node);

  const depthStyles = [
    "text-base font-semibold text-foreground",
    "text-sm font-medium text-foreground",
    "text-sm text-muted-foreground",
  ];
  const textStyle = depthStyles[Math.min(depth, depthStyles.length - 1)];

  return (
    <div className={`${depth > 0 ? "mr-4 border-r border-border pr-4" : ""}`}>
      <div className="flex items-start gap-2 py-2">
        {nodeHasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 p-1 hover:bg-accent rounded shrink-0"
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

        <div className="flex-1 min-w-0">
          {nodeIsNavigable ? (
            <Link
              href={`/${bookId}/${node.number}`}
              className={`block hover:text-primary transition-colors ${textStyle}`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-primary" />
                <span>المادة {node.number}</span>
              </div>
            </Link>
          ) : (
            <div className={textStyle}>{label}</div>
          )}
        </div>
      </div>

      {isExpanded && nodeHasChildren && (
        <div className="mt-1">
          {childrenArrays.map(({ key, children }) => (
            <div key={key}>
              {children.map((child, index) => (
                <ChildTreeNode
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

export default function ArticlePage() {
  const params = useParams();
  const bookId = params.bookId as string;
  const articleNumber = params.articleNumber as string;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [bookData, setBookData] = useState<GenericNode | null>(null);
  const [articleData, setArticleData] = useState<FindResult | null>(null);
  const [navigation, setNavigation] = useState<{
    prev: GenericNode | null;
    next: GenericNode | null;
  }>({ prev: null, next: null });
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

  // Load book and find article using static imports
  useEffect(() => {
    setLoading(true);
    setError(null);

    const book = bookDataMap[bookId];
    if (!book) {
      setError("الكتاب غير موجود");
      setLoading(false);
      return;
    }

    setBookData(book);

    // Find the article by number
    const result = findNodeByNumber(book, articleNumber);
    if (!result) {
      setError("المادة غير موجودة");
      setLoading(false);
      return;
    }

    setArticleData(result);

    // Build navigation (prev/next)
    const allNavigable = collectNavigableNodes(book);
    const currentIndex = allNavigable.findIndex((n) => n.number === articleNumber);
    setNavigation({
      prev: currentIndex > 0 ? allNavigable[currentIndex - 1] : null,
      next: currentIndex < allNavigable.length - 1 ? allNavigable[currentIndex + 1] : null,
    });

    setLoading(false);
  }, [bookId, articleNumber]);

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

  // Build breadcrumb from path
  const breadcrumbItems = articleData
    ? [
        ...articleData.path.map((node) => ({
          label: getNodeLabel(node),
          href: isNavigable(node) ? `/${bookId}/${node.number}` : `/${bookId}`,
        })),
        {
          label: `المادة ${articleNumber}`,
          href: `/${bookId}/${articleNumber}`,
        },
      ]
    : [];

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
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
              <Link href="/" className="hover:text-primary flex items-center gap-1">
                <Home className="h-4 w-4" />
                <span>الرئيسية</span>
              </Link>
              <ChevronLeft className="h-4 w-4" />
              <Link href={`/${bookId}`} className="hover:text-primary">
                {bookData ? getNodeLabel(bookData) : "الكتاب"}
              </Link>
              {breadcrumbItems.slice(1, -1).map((item, index) => (
                <span key={index} className="flex items-center gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  {item.href !== `/${bookId}` ? (
                    <Link href={item.href} className="hover:text-primary">
                      {item.label}
                    </Link>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </span>
              ))}
              <ChevronLeft className="h-4 w-4" />
              <span className="text-foreground">المادة {articleNumber}</span>
            </nav>

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive text-lg">{error}</p>
                <Link href={`/${bookId}`} className="text-primary hover:underline mt-4 inline-block">
                  العودة للكتاب
                </Link>
              </div>
            ) : articleData ? (
              <div className="space-y-6">
                {/* Article content */}
                <div className="bg-card rounded-lg border border-border p-6">
                  <ArticleView
                    article={{
                      number: articleData.node.number || "",
                      paragraphs: articleData.node.paragraphs || [],
                    }}
                    bookTitle={bookData?.name}
                    chapterTitle={
                      articleData.path.length > 0
                        ? getNodeLabel(articleData.path[articleData.path.length - 1])
                        : undefined
                    }
                  />

                  {/* If this article has children, render them */}
                  {hasChildren(articleData.node) && (
                    <div className="mt-8 pt-6 border-t border-border">
                      <h3 className="text-lg font-semibold mb-4">المحتويات</h3>
                      <div className="space-y-2">
                        {getChildrenArrays(articleData.node).map(({ key, children }) => (
                          <div key={key}>
                            {children.map((child, index) => (
                              <ChildTreeNode
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
                  )}
                </div>

                {/* Navigation */}
                <ArticleNav
                  navigation={{
                    current: {
                      number: articleNumber,
                      bookId: bookId,
                    },
                    previous: navigation.prev
                      ? {
                          number: navigation.prev.number || "",
                          bookId: bookId,
                          href: `/${bookId}/${navigation.prev.number}`,
                        }
                      : undefined,
                    next: navigation.next
                      ? {
                          number: navigation.next.number || "",
                          bookId: bookId,
                          href: `/${bookId}/${navigation.next.number}`,
                        }
                      : undefined,
                  }}
                />
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
