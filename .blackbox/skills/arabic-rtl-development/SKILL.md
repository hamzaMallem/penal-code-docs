---
name: arabic-rtl-development
description: Best practices for Arabic RTL development in Next.js with proper typography, layout, and accessibility for legal documentation
---

# Arabic RTL Development

## Instructions

- Always use `dir="rtl"` on the root `<html>` element.
- Use Arabic-optimized fonts like IBM Plex Sans Arabic or Noto Kufi Arabic.
- Test layout with long Arabic text to ensure correct formatting.
- Use CSS logical properties instead of fixed directional ones (e.g., `margin-inline-start` instead of `margin-left`).
- Adjust styles and text alignment to improve readability in Arabic.
- Mirror icons carefully only when necessary.

## Example Root Layout Setup

```tsx
import { IBM_Plex_Sans_Arabic } from 'next/font/google';

const arabicFont = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={arabicFont.variable}>
      <body className="font-arabic">{children}</body>
    </html>
  );
}; ```
--- 
## Best Practices
   - Use appropriate Arabic fonts for better user experience.
   - Avoid hardcoded LTR CSS properties.
   - Make sure scrollbars appear on the left side for RTL.
   - Fully test with Arabic keyboard input.
 ## Testing Checklist
   - [ ] Text flows right-to-left correctly.
   - [ ] Scrollbars are on the left side.
   - [ ] Important icons are mirrored properly.
   - [ ] Input fields support Arabic characters.
---