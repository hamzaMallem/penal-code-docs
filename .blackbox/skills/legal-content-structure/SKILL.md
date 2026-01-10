
---
name: legal-content-structure
description: Understanding and managing the complex multi-level nested Moroccan legal document structure used in Qanun Docs.
---

# Legal Content Structure

## Instructions

- Never assume a fixed hierarchy; structure varies between books.
- Treat data as deeply nested trees without normalization.
- Articles may contain child articles.
- Use recursive rendering to display any tree depth.
- Only nodes with `number` property are navigable (routable).

## Generic Data Model

```ts
interface GenericNode {
  name?: string;
  title?: string;
  number?: string;
  paragraphs?: string[];
  chapters?: GenericNode[];
  sections?: GenericNode[];
  branches?: GenericNode[];
  articles?: GenericNode[];
  subsections?: GenericNode[];
}

## Recursive Rendering Example
 function renderNode(node: GenericNode, depth = 0) {
  const childrenArrays = [
    node.chapters,
    node.sections,
    node.branches,
    node.articles,
    node.subsections,
  ].filter(Boolean);

  return (
    <div style={{ marginLeft: depth * 20 }}>
      {node.number ? (
        <a href={`/${node.number}`}>{node.name || node.title}</a>
      ) : (
        <span>{node.name || node.title}</span>
      )}
      {childrenArrays.map((children) =>
        children.map((child) => renderNode(child, depth + 1))
      )}
    </div>
  );
}

## Best Practices
    - Do not reshape or normalize the data.
    - Preserve original data order.
    - Distinguish clickable (navigable) nodes.
    - Use flexible routing based on the number field.