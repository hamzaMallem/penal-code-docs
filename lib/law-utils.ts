import type { Law, Book, Chapter, Section, Article, NavItem, BreadcrumbItem } from "./types";

/**
 * Flatten all articles from the law structure for search indexing
 * تسطيح جميع المواد من هيكل القانون للفهرسة في البحث
 */
export function flattenArticles(law: Law) {
  const articles: {
    articleNumber: string;
    bookName: string;
    bookId: string;
    chapterName: string;
    sectionName?: string;
    content: string;
  }[] = [];

  law.books.forEach((book, bookIndex) => {
    const bookId = `book_${bookIndex}`;
    
    book.chapters.forEach((chapter) => {
      // Articles directly in chapter
      if (chapter.articles) {
        chapter.articles.forEach((article) => {
          articles.push({
            articleNumber: article.number,
            bookName: book.name,
            bookId,
            chapterName: chapter.name,
            content: article.paragraphs.join(" "),
          });
        });
      }

      // Articles in sections
      if (chapter.sections) {
        processSection(chapter.sections, book.name, bookId, chapter.name, articles);
      }
    });
  });

  return articles;
}

/**
 * Process sections recursively
 * معالجة الفروع بشكل متكرر
 */
function processSection(
  sections: Section[],
  bookName: string,
  bookId: string,
  chapterName: string,
  articles: {
    articleNumber: string;
    bookName: string;
    bookId: string;
    chapterName: string;
    sectionName?: string;
    content: string;
  }[],
  parentSectionName?: string
) {
  sections.forEach((section) => {
    const sectionName = parentSectionName
      ? `${parentSectionName} - ${section.name}`
      : section.name;

    if (section.articles) {
      section.articles.forEach((article) => {
        articles.push({
          articleNumber: article.number,
          bookName,
          bookId,
          chapterName,
          sectionName,
          content: article.paragraphs.join(" "),
        });
      });
    }

    if (section.subsections) {
      processSection(section.subsections, bookName, bookId, chapterName, articles, sectionName);
    }
  });
}

/**
 * Build navigation items from law structure
 * بناء عناصر التنقل من هيكل القانون
 */
export function buildNavItems(law: Law): NavItem[] {
  return law.books.map((book, bookIndex) => {
    const bookId = `book_${bookIndex}`;
    
    return {
      id: bookId,
      label: `${book.name}: ${book.title}`,
      href: `/${bookId}`,
      isExpanded: false,
      children: book.chapters.map((chapter, chapterIndex) => {
        const chapterId = `${bookId}_chapter_${chapterIndex}`;
        
        return {
          id: chapterId,
          label: `${chapter.name}: ${chapter.title}`,
          href: `/${bookId}/${chapterId}`,
          children: buildChapterChildren(chapter, bookId, chapterId),
        };
      }),
    };
  });
}

/**
 * Build chapter children (sections or articles)
 * بناء عناصر الباب الفرعية
 */
function buildChapterChildren(
  chapter: Chapter,
  bookId: string,
  chapterId: string
): NavItem[] {
  const children: NavItem[] = [];

  // Add sections
  if (chapter.sections) {
    chapter.sections.forEach((section, sectionIndex) => {
      const sectionId = `${chapterId}_section_${sectionIndex}`;
      children.push({
        id: sectionId,
        label: `${section.name}: ${section.title}`,
        href: `/${bookId}/${sectionId}`,
        children: buildSectionChildren(section, bookId, sectionId),
      });
    });
  }

  // Add direct articles
  if (chapter.articles) {
    chapter.articles.forEach((article) => {
      children.push({
        id: `article_${article.number}`,
        label: `المادة ${article.number}`,
        href: `/${bookId}/${article.number}`,
      });
    });
  }

  return children;
}

/**
 * Build section children
 * بناء عناصر الفرع الفرعية
 */
function buildSectionChildren(
  section: Section,
  bookId: string,
  sectionId: string
): NavItem[] {
  const children: NavItem[] = [];

  // Add subsections
  if (section.subsections) {
    section.subsections.forEach((subsection, subsectionIndex) => {
      const subsectionId = `${sectionId}_subsection_${subsectionIndex}`;
      children.push({
        id: subsectionId,
        label: `${subsection.name}: ${subsection.title}`,
        href: `/${bookId}/${subsectionId}`,
        children: buildSectionChildren(subsection, bookId, subsectionId),
      });
    });
  }

  // Add articles
  if (section.articles) {
    section.articles.forEach((article) => {
      children.push({
        id: `article_${article.number}`,
        label: `المادة ${article.number}`,
        href: `/${bookId}/${article.number}`,
      });
    });
  }

  return children;
}

/**
 * Find article by number
 * البحث عن مادة برقمها
 */
export function findArticle(
  law: Law,
  articleNumber: string
): {
  article: Article;
  book: Book;
  chapter: Chapter;
  section?: Section;
} | null {
  for (const book of law.books) {
    for (const chapter of book.chapters) {
      // Check direct articles
      if (chapter.articles) {
        const article = chapter.articles.find((a) => a.number === articleNumber);
        if (article) {
          return { article, book, chapter };
        }
      }

      // Check sections
      if (chapter.sections) {
        const result = findArticleInSections(chapter.sections, articleNumber);
        if (result) {
          return { ...result, book, chapter };
        }
      }
    }
  }

  return null;
}

/**
 * Find article in sections recursively
 * البحث عن مادة في الفروع بشكل متكرر
 */
function findArticleInSections(
  sections: Section[],
  articleNumber: string
): { article: Article; section: Section } | null {
  for (const section of sections) {
    if (section.articles) {
      const article = section.articles.find((a) => a.number === articleNumber);
      if (article) {
        return { article, section };
      }
    }

    if (section.subsections) {
      const result = findArticleInSections(section.subsections, articleNumber);
      if (result) {
        return result;
      }
    }
  }

  return null;
}

/**
 * Build breadcrumbs for an article
 * بناء مسار التنقل لمادة
 */
export function buildBreadcrumbs(
  book: Book,
  chapter: Chapter,
  section?: Section,
  articleNumber?: string
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "الرئيسية", href: "/" },
    { label: book.name, href: `/${book.name}` },
    { label: chapter.name, href: `/${book.name}/${chapter.name}` },
  ];

  if (section) {
    breadcrumbs.push({
      label: section.name,
      href: `/${book.name}/${chapter.name}/${section.name}`,
    });
  }

  if (articleNumber) {
    breadcrumbs.push({
      label: `المادة ${articleNumber}`,
      href: `/${book.name}/${articleNumber}`,
    });
  }

  return breadcrumbs;
}

/**
 * Get all article numbers in order
 * الحصول على جميع أرقام المواد بالترتيب
 */
export function getAllArticleNumbers(law: Law): string[] {
  const articles = flattenArticles(law);
  return articles.map((a) => a.articleNumber);
}

/**
 * Get previous and next article numbers
 * الحصول على رقم المادة السابقة والتالية
 */
export function getArticleNavigation(
  law: Law,
  currentArticleNumber: string
): {
  previous?: string;
  next?: string;
} {
  const allNumbers = getAllArticleNumbers(law);
  const currentIndex = allNumbers.indexOf(currentArticleNumber);

  if (currentIndex === -1) {
    return {};
  }

  return {
    previous: currentIndex > 0 ? allNumbers[currentIndex - 1] : undefined,
    next: currentIndex < allNumbers.length - 1 ? allNumbers[currentIndex + 1] : undefined,
  };
}
