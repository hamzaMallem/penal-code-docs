/**
 * Dynamic data loader for law sources
 * محمل البيانات الديناميكي لمصادر القوانين
 */

import { getLawSource, getArticleLabel } from "./law-sources";

// Static imports for all book JSON files
// الاستيرادات الثابتة لجميع ملفات JSON للكتب

// Criminal Procedure Law (cpp) - قانون المسطرة الجنائية
import cpp_book_0 from "@/data/cpp/book_0.json";
import cpp_book_1st from "@/data/cpp/book_1st.json";
import cpp_book_2nd from "@/data/cpp/book_2nd.json";
import cpp_book_3rd from "@/data/cpp/book_3rd.json";
import cpp_book_4th from "@/data/cpp/book_4th.json";
import cpp_book_5th from "@/data/cpp/book_5th.json";
import cpp_book_6th from "@/data/cpp/book_6th.json";
import cpp_book_7th from "@/data/cpp/book_7th.json";
import cpp_book_8th from "@/data/cpp/book_8th.json";

// Criminal Law (dp) - القانون الجنائي
import dp_code_book_0 from "@/data/dp/code_book_0.json";
import dp_code_book_1 from "@/data/dp/code_book_1.json";
import dp_code_book_2 from "@/data/dp/code_book_2.json";
import dp_code_book_3 from "@/data/dp/code_book_3.json";

/**
 * Generic node interface for JSON data
 * واجهة عامة للعقد في بيانات JSON
 */
export interface GenericNode {
  name?: string;
  title?: string;
  number?: string;
  paragraphs?: string[];
  chapters?: GenericNode[];
  sections?: GenericNode[];
  branches?: GenericNode[];
  articles?: GenericNode[];
  subsections?: GenericNode[];
  [key: string]: unknown;
}

/**
 * Static book data map
 * خريطة بيانات الكتب الثابتة
 */
const BOOK_DATA: Record<string, Record<string, GenericNode>> = {
  cpp: {
    book_0: cpp_book_0 as unknown as GenericNode,
    book_1st: cpp_book_1st as unknown as GenericNode,
    book_2nd: cpp_book_2nd as unknown as GenericNode,
    book_3rd: cpp_book_3rd as unknown as GenericNode,
    book_4th: cpp_book_4th as unknown as GenericNode,
    book_5th: cpp_book_5th as unknown as GenericNode,
    book_6th: cpp_book_6th as unknown as GenericNode,
    book_7th: cpp_book_7th as unknown as GenericNode,
    book_8th: cpp_book_8th as unknown as GenericNode,
  },
  dp: {
    code_book_0: dp_code_book_0 as unknown as GenericNode,
    code_book_1: dp_code_book_1 as unknown as GenericNode,
    code_book_2: dp_code_book_2 as unknown as GenericNode,
    code_book_3: dp_code_book_3 as unknown as GenericNode,
  },
};

/**
 * Get available book IDs for a law source
 * الحصول على معرفات الكتب المتاحة لمصدر قانون
 */
export function getAvailableBookIds(lawKey: string): string[] {
  const lawBooks = BOOK_DATA[lawKey];
  if (!lawBooks) {
    return [];
  }
  return Object.keys(lawBooks);
}

/**
 * Known children property names in the JSON structure
 * أسماء خصائص الأبناء المعروفة في هيكل JSON
 */
export const CHILDREN_KEYS = [
  "chapters",
  "sections",
  "branches",
  "articles",
  "subsections",
] as const;

/**
 * Get all children arrays from a node
 * الحصول على جميع مصفوفات الأبناء من عقدة
 */
export function getChildrenArrays(
  node: GenericNode
): { key: string; children: GenericNode[] }[] {
  const result: { key: string; children: GenericNode[] }[] = [];

  for (const key of CHILDREN_KEYS) {
    const children = node[key] as GenericNode[] | undefined;
    if (children && Array.isArray(children) && children.length > 0) {
      result.push({ key, children });
    }
  }

  return result;
}

/**
 * Check if a node has any children
 * التحقق مما إذا كانت العقدة تحتوي على أبناء
 */
export function hasChildren(node: GenericNode): boolean {
  return getChildrenArrays(node).length > 0;
}

/**
 * Check if a node is navigable (has a number property)
 * التحقق مما إذا كانت العقدة قابلة للتنقل (لديها خاصية الرقم)
 */
export function isNavigable(node: GenericNode): boolean {
  return typeof node.number === "string" && node.number.length > 0;
}

/**
 * Get display label for a node
 * الحصول على التسمية المعروضة لعقدة
 * @param node - The node to get label for
 * @param lawKey - Optional law key to determine article label (المادة vs الفصل)
 */
export function getNodeLabel(node: GenericNode, lawKey?: string): string {
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
    const articleLabel = lawKey ? getArticleLabel(lawKey) : "المادة";
    return `${articleLabel} ${node.number}`;
  }
  return "عنصر";
}

/**
 * Find the first article (navigable node) in a tree recursively
 * البحث عن أول مادة (عقدة قابلة للتنقل) في شجرة بشكل متكرر
 */
export function findFirstArticle(node: GenericNode): GenericNode | null {
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

/**
 * Recursively find a node by its number and collect path info
 * البحث بشكل متكرر عن عقدة برقمها وجمع معلومات المسار
 */
export interface FindResult {
  node: GenericNode;
  path: GenericNode[]; // Ancestors from root to parent
  pathIndices: number[]; // Indices of each ancestor for contextual navigation
}

export function findNodeByNumber(
  root: GenericNode,
  targetNumber: string,
  path: GenericNode[] = [],
  pathIndices: number[] = []
): FindResult | null {
  // Check if current node matches
  if (root.number === targetNumber) {
    return { node: root, path, pathIndices };
  }

  // Search in all children arrays
  const childrenArrays = getChildrenArrays(root);
  let flatIndex = 0;
  
  for (const { children } of childrenArrays) {
    for (const child of children) {
      const result = findNodeByNumber(
        child, 
        targetNumber, 
        [...path, root],
        [...pathIndices, flatIndex]
      );
      if (result) {
        return result;
      }
      flatIndex++;
    }
  }

  return null;
}

/**
 * Collect all navigable nodes (nodes with number) in order
 * جمع جميع العقد القابلة للتنقل (العقد ذات الرقم) بالترتيب
 */
export function collectNavigableNodes(
  node: GenericNode,
  result: GenericNode[] = []
): GenericNode[] {
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

/**
 * Load book data by law key and book ID (synchronous - uses static imports)
 * تحميل بيانات الكتاب حسب مفتاح القانون ومعرف الكتاب (متزامن - يستخدم الاستيرادات الثابتة)
 */
export async function loadBookData(
  lawKey: string,
  bookId: string
): Promise<GenericNode | null> {
  const lawSource = getLawSource(lawKey);
  if (!lawSource) {
    return null;
  }

  const lawBooks = BOOK_DATA[lawKey];
  if (!lawBooks) {
    return null;
  }

  const bookData = lawBooks[bookId];
  if (!bookData) {
    return null;
  }

  return bookData;
}

/**
 * Load book data synchronously
 * تحميل بيانات الكتاب بشكل متزامن
 */
export function loadBookDataSync(
  lawKey: string,
  bookId: string
): GenericNode | null {
  const lawBooks = BOOK_DATA[lawKey];
  if (!lawBooks) {
    return null;
  }

  return lawBooks[bookId] || null;
}

/**
 * Get all book IDs for a law source
 * الحصول على جميع معرفات الكتب لمصدر قانون
 */
export async function getAllBooks(lawKey: string): Promise<string[]> {
  return getAvailableBookIds(lawKey);
}

/**
 * Searchable article interface
 * واجهة المادة القابلة للبحث
 */
export interface SearchableArticle {
  articleNumber: string;
  lawKey: string;
  bookId: string;
  bookName: string;
  chapterName: string;
  sectionName?: string;
  content: string;
}

/**
 * Extract all articles from a node recursively
 * استخراج جميع المواد من عقدة بشكل متكرر
 */
export function extractArticles(
  node: GenericNode,
  lawKey: string,
  bookId: string,
  bookName: string,
  path: string[] = []
): SearchableArticle[] {
  const articles: SearchableArticle[] = [];

  // Check if this node is an article
  if (node.number && node.paragraphs) {
    const content = node.paragraphs.join(" ");
    articles.push({
      articleNumber: node.number,
      lawKey,
      bookId,
      bookName,
      chapterName: path[0] || bookName,
      sectionName: path.slice(1).join(" > ") || undefined,
      content,
    });
  }

  // Recursively process children
  for (const key of CHILDREN_KEYS) {
    const children = node[key] as GenericNode[] | undefined;
    if (children && Array.isArray(children)) {
      for (const child of children) {
        const childPath =
          child.name || child.title
            ? [...path, `${child.name || ""} ${child.title || ""}`.trim()]
            : path;
        articles.push(
          ...extractArticles(child, lawKey, bookId, bookName, childPath)
        );
      }
    }
  }

  return articles;
}

/**
 * Get all searchable articles from all law sources
 * الحصول على جميع المواد القابلة للبحث من جميع مصادر القوانين
 */
export async function getAllSearchableArticles(): Promise<
  SearchableArticle[]
> {
  const allArticles: SearchableArticle[] = [];

  // Import law sources dynamically to avoid circular dependency
  const { getLawSources } = await import("./law-sources");
  const lawSources = getLawSources();

  for (const lawSource of lawSources) {
    const bookIds = getAvailableBookIds(lawSource.key);

    for (const bookId of bookIds) {
      const bookData = await loadBookData(lawSource.key, bookId);
      if (bookData) {
        const bookName = getNodeLabel(bookData, lawSource.key);
        const bookArticles = extractArticles(
          bookData,
          lawSource.key,
          bookId,
          bookName
        );
        allArticles.push(...bookArticles);
      }
    }
  }

  return allArticles;
}

/**
 * Generate a unique node ID from a path of nodes
 * توليد معرف فريد للعقدة من مسار العقد
 * 
 * Format: "depth-index" for each level, joined by underscore
 * Example: "0-0_1-2_2-1" means: first child at depth 0, third child at depth 1, second child at depth 2
 */
export function generateNodePath(pathIndices: number[]): string {
  return pathIndices.map((index, depth) => `${depth}-${index}`).join("_");
}

/**
 * Parse a node path string back to indices
 * تحليل سلسلة مسار العقدة إلى مؤشرات
 */
export function parseNodePath(pathString: string): number[] {
  if (!pathString) return [];
  
  try {
    return pathString.split("_").map((part) => {
      const [, indexStr] = part.split("-");
      return parseInt(indexStr, 10);
    });
  } catch {
    return [];
  }
}

/**
 * Find a node by its path indices
 * البحث عن عقدة بمؤشرات مسارها
 */
export function findNodeByPath(
  root: GenericNode,
  pathIndices: number[]
): GenericNode | null {
  if (pathIndices.length === 0) {
    return root;
  }

  let current: GenericNode = root;
  
  for (const index of pathIndices) {
    const childrenArrays = getChildrenArrays(current);
    
    // Flatten all children into a single array to find by index
    const allChildren: GenericNode[] = [];
    for (const { children } of childrenArrays) {
      allChildren.push(...children);
    }
    
    if (index >= allChildren.length) {
      return null;
    }
    
    current = allChildren[index];
  }
  
  return current;
}

/**
 * Build path indices for a target node within a tree
 * بناء مؤشرات المسار لعقدة هدف داخل شجرة
 */
export function buildPathIndices(
  root: GenericNode,
  targetNode: GenericNode,
  currentPath: number[] = []
): number[] | null {
  // Check if current node is the target
  if (root === targetNode) {
    return currentPath;
  }

  // Search in all children
  const childrenArrays = getChildrenArrays(root);
  let flatIndex = 0;
  
  for (const { children } of childrenArrays) {
    for (const child of children) {
      const result = buildPathIndices(child, targetNode, [...currentPath, flatIndex]);
      if (result) {
        return result;
      }
      flatIndex++;
    }
  }

  return null;
}

/**
 * Build contextual navigation URL for a node in the book page
 * بناء رابط التنقل السياقي لعقدة في صفحة الكتاب
 * 
 * @param lawKey - Law key (cpp, dp)
 * @param bookId - Book ID
 * @param pathIndices - Array of indices representing the path to the node
 * @returns URL string like /cpp/book_1st?expand=0-0_1-2
 */
export function buildContextualBookUrl(
  lawKey: string,
  bookId: string,
  pathIndices: number[]
): string {
  const basePath = `/${lawKey}/${bookId}`;
  if (pathIndices.length === 0) {
    return basePath;
  }
  const expandParam = generateNodePath(pathIndices);
  return `${basePath}?expand=${expandParam}`;
}
