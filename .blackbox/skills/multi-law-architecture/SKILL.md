
---

# Skill 3: multi-law-architecture/SKILL.md


```
---
name: multi-law-architecture
description: Scalable architecture to support multiple distinct Moroccan laws with unified navigation in Qanun Docs.
---

# Multi-Law Architecture

## Instructions

- Use `lawId` in routing: `/[lawId]/[bookId]/[articleNumber]`.
- Maintain a central Law Registry JSON with metadata for each law.
- Keep JSON data structure uniform across different laws.
- Support cross-law global search.
- Optionally use color coding or theming to differentiate laws.

## Project Structure Example

/data/ laws.json code_procedure_penale/ code_penal_general/ code_penal_special/

/app/ /[lawId]/ /[bookId]/ /[articleNumber]/


## Example Law Registry (laws.json)

```json
{
  "laws": [
    {
      "id": "code_procedure_penale",
      "shortName": "م.ج",
      "fullName": "قانون المسطرة الجنائية",
      "articleCount": 679,
      "color": "#5C6BC0"
    },
    {
      "id": "code_penal_general",
      "shortName": "ق.ج.ع",
      "fullName": "القانون الجنائي العام",
      "articleCount": 594,
      "color": "#E53935"
    }
  ]
}

## Best Practices
   - Lazy load law data as needed.
   - Facilitate adding new laws by keeping a unified format.
   - Use shared API/utilities for fetching law data uniformly.
   - Provide UI for law selection and easy switching.

