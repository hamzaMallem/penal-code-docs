---
name: accessibility-font-control
description: Enable user control over font size in Qanun Docs to improve readability and accessibility.
---

# Font Size Control

## Instructions

- Provide UI controls to increase, decrease, and reset font size.
- Use CSS custom properties (variables) to enable dynamic changes.
- Persist user's font size choice in localStorage.
- Apply font-size control to main text elements like paragraphs and headings.

## CSS Example

```css
:root {
  --font-size-base: 18px;
}

body {
  font-size: var(--font-size-base);
}

## React Example
tsx

Copy code
const [fontSize, setFontSize] = useState(() => {
  return localStorage.getItem('fontSize') || '18px';
});

useEffect(() => {
  document.documentElement.style.setProperty('--font-size-base', fontSize);
  localStorage.setItem('fontSize', fontSize);
}, [fontSize]);

// Controls to update fontSize with buttons for 14px, 16px, 18px, 20px etc.
----

## Best Practices
    - Make controls accessible and keyboard-navigable.
    - Test readability at different sizes.
    - Use Rem or CSS variables to centralize font resizing.