---
"@theseus-cwl/ui-react-editor": minor
---

Standalone multi-file editing with CSS-variable theming.

- **Breaking:** `CwlCodeEditor` no longer depends on `@theseus-cwl/parser` — it renders the files of a `CwlSource` directly as tabs.
- **Breaking:** the bundled dark theme is replaced by `--cwl-code-editor-*` CSS-variable theming.
- Editor extensions are configurable, file tabs are styled, and the stylesheet is exposed through the package `style` export.
- Improved active-file detection.
