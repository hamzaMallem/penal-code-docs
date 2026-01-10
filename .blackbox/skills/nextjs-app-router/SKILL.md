
---
name: nextjs-app-router
description: Best practices for Next.js 14+ App Router with TypeScript, focusing on static generation and dynamic routing.
---

# Next.js App Router

## Instructions

- Use Next.js App Router conventions (no Pages Router mix).
- Use `generateStaticParams` for static generation of dynamic routes.
- Favor Server Components; use `'use client'` only when necessary.
- Generate SEO metadata with `generateMetadata`.
- Use strict typing on route parameters (`params`).

## Example of generateStaticParams

```ts
export async function generateStaticParams() {
  const books = ['book_0', 'book_1']; // replace with actual data
  const params = [];

  for (const bookId of books) {
    const bookData = await import(`@/data/code_procedure_penale/${bookId}.json`);
    const articles = extractAllArticles(bookData.default);
    for (const article of articles) {
      params.push({ bookId, articleNumber: article.number });
    }
  }

  return params;
}

## Metadata Example
 export async function generateMetadata({ params }) {
  const article = await getArticle(params.bookId, params.articleNumber);
  if (!article) {
    return { title: 'Article Not Found' };
  }
  return {
    title: `Article ${article.number} - ${article.title}`,
    description: article.paragraphs?.[0]?.slice(0, 160),
  };
}
## Best Practices
   -  Keep most pages as Server Components for better performance.
   -  Consider Incremental Static Regeneration (ISR) if needed.
   -  Monitor data size to avoid slow builds or slow rendering.