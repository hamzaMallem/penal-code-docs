/**
 * Law sources configuration
 * إعدادات مصادر القوانين
 */

import type { LawSource } from "./types";

/**
 * Available law sources
 * مصادر القوانين المتاحة
 * 
 * IMPORTANT SEMANTIC RULE:
 * - Criminal Procedure Law (cpp) uses: "المادة"
 * - Criminal Law (dp) uses: "الفصل"
 */
export const LAW_SOURCES: Record<string, LawSource> = {
  cpp: {
    key: "cpp",
    label: "قانون المسطرة الجنائية",
    path: "data/cpp",
    description: "القانون رقم 22.01 المعدل بالقانون رقم 03.23",
    articleLabel: "المادة",
  },
  dp: {
    key: "dp",
    label: "القانون الجنائي (العام والخاص)",
    path: "data/dp",
    description: "القانون الجنائي المغربي",
    articleLabel: "الفصل",
  },
  "dahir-1974-drogues": {
    key: "dahir-1974-drogues",
    label: "ظهير شريف بمثابة قانون رقم 1.73.282",
    path: "data/dahir-1974-drogues",
    description: "بتاريخ 28 ربيع الثاني 1394 (21 مايو 1974) يتعلق بزجر الإدمان على المخدرات السامة ووقاية المدمنين على هذه المخدرات",
    articleLabel: "الفصل",
  },
  "loi-13-21": {
    key: "loi-13-21",
    label: "القانون رقم 13.21 المتعلق بالاستعمالات القانونية للقنب الهندي",
    path: "data/loi-13-21",
    description: "قانون الاستعمالات القانونية للقنب الهندي",
    articleLabel: "المادة",
  },
  moudawana: {
    key: "moudawana",
    label: "مدونة الأسرة",
    path: "data/moudawana",
    description: "القانون رقم 70.03 بمثابة مدونة الأسرة",
    articleLabel: "المادة",
  },
};

/**
 * Get all law sources
 * الحصول على جميع مصادر القوانين
 */
export function getLawSources(): LawSource[] {
  return Object.values(LAW_SOURCES);
}

/**
 * Get a specific law source by key
 * الحصول على مصدر قانون محدد بالمفتاح
 */
export function getLawSource(key: string): LawSource | undefined {
  return LAW_SOURCES[key];
}

/**
 * Get law source by data path
 * الحصول على مصدر القانون بمسار البيانات
 */
export function getLawSourceByPath(path: string): LawSource | undefined {
  return Object.values(LAW_SOURCES).find((source) => source.path === path);
}

/**
 * Check if a law source key is valid
 * التحقق من صحة مفتاح مصدر القانون
 */
export function isValidLawSource(key: string): boolean {
  return key in LAW_SOURCES;
}

/**
 * Get article label for a law source
 * الحصول على تسمية المادة لمصدر القانون
 * Returns "المادة" for cpp, "الفصل" for dp
 */
export function getArticleLabel(lawKey: string): string {
  const source = LAW_SOURCES[lawKey];
  return source?.articleLabel || "المادة";
}
