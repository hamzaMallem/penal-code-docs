---
name: performance-optimization
description: Strategies to optimize Qanun Docs performance for low-end devices and mobile.
---

# Performance Optimization

## Instructions

- Use code splitting and lazy loading for heavy components.
- Minimize bundle size by removing unused dependencies.
- Use modern image formats like WebP with proper sizing.
- Implement smart caching strategies for pages and data.
- Avoid unnecessary re-renders using React.memo and useMemo.

## Examples

- Use `React.lazy` to load components asynchronously.
- Move search/filtering logic to server side if possible.
- Use CDN to serve static assets.

## Best Practices

- Monitor performance with tools like Lighthouse or WebPageTest.
- Ensure smooth and responsive UI.
- Minify CSS and JS files.
- Avoid loading large dependencies unnecessarily.