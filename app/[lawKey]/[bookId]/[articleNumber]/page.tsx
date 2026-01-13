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
import { MobileArticleNav } from "@/components/features/MobileArticleNav";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { useLawSearch } from "@/hooks/useLawSearch";
import { ChevronLeft, Home, ChevronDown, FileText } from "lucide-react";
import {
  loadBookData,
  findNodeByNumber,
  collectNavigableNodes,
  getChildrenArrays,
  hasChildren,
  isNavigable,
  getNodeLabel,
  generateNodePath,
  type GenericNode,
  type FindResult,
} from "@/lib/data-loader";
import { getLawSource, getArticleLabel } from "@/lib/law-sources";

// Tree node component for rendering children of an article
function ChildTreeNode({
  node,
  lawKey,
  bookId,
  depth = 0,
}: {
  node: GenericNode;
  lawKey: string;
  bookId: string;
  depth?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const childrenArrays = getChildrenArrays(node);
  const nodeHasChildren = childrenArrays.length > 0;
  const nodeIsNavigable = isNavigable(node);
  const label = getNodeLabel(node, lawKey);
  const articleLabel = getArticleLabel(lawKey);

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
              href={`/${lawKey}/${bookId}/${node.number}`}
              className={`block hover:text-primary transition-colors ${textStyle}`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-primary" />
                <span>{articleLabel} {node.number}</span>
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
                  lawKey={lawKey}
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
  const lawKey = params.lawKey as string;
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

  // Contextual search for this law
  const { search } = useLawSearch(lawKey);

  // Keyboard navigation
  useKeyboardNav({
    onSearchOpen: () => setIsSearchOpen(true),
    onEscape: () => {
      setIsSearchOpen(false);
      setIsSidebarOpen(false);
    },
  });

  // Load book and find article
  useEffect(() => {
    setLoading(true);
    setError(null);

    loadBookData(lawKey, bookId)
      .then((book) => {
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
        const currentIndex = allNavigable.findIndex(
          (n) => n.number === articleNumber
        );
        setNavigation({
          prev: currentIndex > 0 ? allNavigable[currentIndex - 1] : null,
          next:
            currentIndex < allNavigable.length - 1
              ? allNavigable[currentIndex + 1]
              : null,
        });

        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading article:", err);
        setError("حدث خطأ أثناء تحميل المادة");
        setLoading(false);
      });
  }, [lawKey, bookId, articleNumber]);

  // Get law source info
  const lawSource = getLawSource(lawKey);
  const articleLabel = getArticleLabel(lawKey);

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

  // Build breadcrumb from path with contextual navigation
  // For non-navigable nodes (Part/Chapter/Section), link to book page with expand param
  const breadcrumbItems = articleData
    ? [
        ...articleData.path.map((node, index) => {
          // Use the actual path indices from findNodeByNumber
          // pathIndices[0..index] gives us the path to this ancestor
          // We skip index 0 because that's the book itself (root)
          const nodePathIndices = articleData.pathIndices.slice(0, index);
          
          return {
            label: getNodeLabel(node, lawKey),
            href: isNavigable(node)
              ? `/${lawKey}/${bookId}/${node.number}`
              : nodePathIndices.length > 0
                ? `/${lawKey}/${bookId}?expand=${generateNodePath(nodePathIndices)}`
                : `/${lawKey}/${bookId}`,
            isNavigable: isNavigable(node),
          };
        }),
        {
          label: `${articleLabel} ${articleNumber}`,
          href: `/${lawKey}/${bookId}/${articleNumber}`,
          isNavigable: true,
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
          lawKey={lawKey}
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
              {lawSource && (
                <Link href={`/${lawKey}`} className="hover:text-primary">
                  {lawSource.label}
                </Link>
              )}
              <ChevronLeft className="h-4 w-4" />
              <Link href={`/${lawKey}/${bookId}`} className="hover:text-primary">
                {bookData ? getNodeLabel(bookData, lawKey) : "الكتاب"}
              </Link>
              {breadcrumbItems.slice(1, -1).map((item, index) => (
                <span key={index} className="flex items-center gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  {item.href !== `/${lawKey}/${bookId}` ? (
                    <Link href={item.href} className="hover:text-primary">
                      {item.label}
                    </Link>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </span>
              ))}
              <ChevronLeft className="h-4 w-4" />
              <span className="text-foreground">{articleLabel} {articleNumber}</span>
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
                  href={`/${lawKey}/${bookId}`}
                  className="text-primary hover:underline mt-4 inline-block"
                >
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
                        ? getNodeLabel(articleData.path[articleData.path.length - 1], lawKey)
                        : undefined
                    }
                    articleLabel={articleLabel}
                    lawLabel={lawSource?.label}
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
                                lawKey={lawKey}
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

                {/* Desktop Navigation */}
                <div className="hidden md:block">
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
                            href: `/${lawKey}/${bookId}/${navigation.prev.number}`,
                          }
                        : undefined,
                      next: navigation.next
                        ? {
                            number: navigation.next.number || "",
                            bookId: bookId,
                            href: `/${lawKey}/${bookId}/${navigation.next.number}`,
                          }
                        : undefined,
                    }}
                    articleLabel={articleLabel}
                  />
                </div>

                {/* Mobile Sticky Bottom Navigation */}
                <MobileArticleNav
                  navigation={{
                    current: {
                      number: articleNumber,
                      bookId: bookId,
                    },
                    previous: navigation.prev
                      ? {
                          number: navigation.prev.number || "",
                          bookId: bookId,
                          href: `/${lawKey}/${bookId}/${navigation.prev.number}`,
                        }
                      : undefined,
                    next: navigation.next
                      ? {
                          number: navigation.next.number || "",
                          bookId: bookId,
                          href: `/${lawKey}/${bookId}/${navigation.next.number}`,
                        }
                      : undefined,
                  }}
                  articleLabel={articleLabel}
                />
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
        searchScope={{ lawKey }}
      />
    </div>
  );
}
