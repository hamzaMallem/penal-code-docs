// TypeScript interfaces for Qanun Docs

/**
 * Represents a single article in the law
 * يمثل مادة واحدة في القانون
 */
export interface Article {
  number: string;          // رقم المادة - e.g., "1", "2-1"
  paragraphs: string[];    // فقرات المادة
}

/**
 * Represents a section within a chapter
 * يمثل فرع داخل باب
 */
export interface Section {
  name: string;            // اسم الفرع - e.g., "الفرع الأول"
  title: string;           // عنوان الفرع
  articles?: Article[];    // مواد الفرع
  subsections?: Section[]; // فروع فرعية
}

/**
 * Represents a chapter within a book
 * يمثل باب داخل كتاب
 */
export interface Chapter {
  name: string;            // اسم الباب - e.g., "الباب الأول"
  title: string;           // عنوان الباب
  sections?: Section[];    // فروع الباب
  articles?: Article[];    // مواد الباب (إذا لم تكن هناك فروع)
}

/**
 * Represents a book in the law
 * يمثل كتاب في القانون
 */
export interface Book {
  name: string;            // اسم الكتاب - e.g., "الكتاب الأول"
  title: string;           // عنوان الكتاب
  chapters: Chapter[];     // أبواب الكتاب
}

/**
 * Represents the entire law structure
 * يمثل هيكل القانون بالكامل
 */
export interface Law {
  title: string;           // عنوان القانون - "قانون المسطرة الجنائية"
  law_number: string;      // رقم القانون - "22.01"
  amendment: string;       // رقم التعديل - "03.23"
  books: Book[];           // كتب القانون
}

/**
 * Law source configuration
 * إعدادات مصدر القانون
 */
export interface LawSource {
  key: string;           // Unique identifier - e.g., "cpp", "dp"
  label: string;         // Display name in Arabic - e.g., "قانون المسطرة الجنائية"
  path: string;          // Data path - e.g., "data/cpp"
  description?: string;  // Optional description
  articleLabel: string;  // Article label - "المادة" for cpp, "الفصل" for dp
}

/**
 * Search result item
 * عنصر نتيجة البحث
 */
export interface SearchResult {
  articleNumber: string;
  lawKey: string;        // Law source key - e.g., "cpp", "dp"
  bookId: string;        // Book ID for navigation - e.g., "book_1st", "code_book_0"
  bookName: string;
  bookTitle: string;     // عنوان الكتاب - e.g., "التحري عن الجرائم ومعاينتها"
  chapterName: string;
  chapterTitle: string;  // عنوان الباب - e.g., "سرية البحث والتحقيق"
  sectionName?: string;
  sectionTitle?: string; // عنوان الفرع
  content: string;
  matchedText: string;
  score: number;
}

/**
 * Navigation item for sidebar
 * عنصر التنقل في الشريط الجانبي
 */
export interface NavItem {
  id: string;
  label: string;
  href: string;
  children?: NavItem[];
  isExpanded?: boolean;
}

/**
 * Breadcrumb item
 * عنصر مسار التنقل
 */
export interface BreadcrumbItem {
  label: string;
  href: string;
}

/**
 * Theme type
 * نوع السمة
 */
export type Theme = "light" | "dark" | "system";

/**
 * Font size type
 * نوع حجم الخط
 */
export type FontSize = "small" | "medium" | "large" | "xlarge";

/**
 * Font size configuration
 * إعدادات حجم الخط
 */
export interface FontSizeConfig {
  label: string;      // التسمية بالعربية
  value: string;      // القيمة بالبكسل
  scale: number;      // معامل التكبير
}

/**
 * Article navigation context
 * سياق التنقل بين المواد
 */
export interface ArticleNavigation {
  current: {
    number: string;
    bookId: string;
  };
  previous?: {
    number: string;
    bookId: string;
    href: string;
  };
  next?: {
    number: string;
    bookId: string;
    href: string;
  };
}

/**
 * Keyboard shortcut definition
 * تعريف اختصار لوحة المفاتيح
 */
export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}
