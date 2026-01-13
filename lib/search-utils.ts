import type { SearchResult } from "./types";

/**
 * Format a human-readable legal path from search result
 * تنسيق مسار قانوني مقروء من نتيجة البحث
 * 
 * Example output: "الكتاب الأول • التحري عن الجرائم ومعاينتها"
 */
export function formatLegalPath(result: SearchResult): string {
  const parts: string[] = [];

  // Add book with title
  if (result.bookName && result.bookTitle) {
    parts.push(`${result.bookName} • ${result.bookTitle}`);
  } else if (result.bookName) {
    parts.push(result.bookName);
  }

  return parts.join(" ");
}

/**
 * Escape special regex characters
 * تهريب الأحرف الخاصة في التعبيرات النمطية
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Escape HTML special characters to prevent XSS
 * تهريب أحرف HTML الخاصة لمنع XSS
 */
function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

/**
 * Highlight search query in text
 * تمييز كلمة البحث في النص
 * 
 * Returns HTML string with <mark> tags around matched terms
 * Arabic-safe, case-insensitive
 */
export function highlightQuery(text: string, query: string): string {
  if (!query || query.length < 2) {
    return escapeHtml(text);
  }

  // Escape HTML first to prevent XSS
  const escapedText = escapeHtml(text);
  const escapedQuery = escapeHtml(query);

  // Create regex pattern (case-insensitive, global)
  // Arabic doesn't have case, but this handles mixed content
  const pattern = new RegExp(`(${escapeRegExp(escapedQuery)})`, "gi");

  // Replace matches with highlighted version
  return escapedText.replace(pattern, '<mark class="bg-yellow-300/50 dark:bg-yellow-500/30 text-inherit rounded-sm px-0.5">$1</mark>');
}
