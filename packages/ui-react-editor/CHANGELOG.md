# @theseus-cwl/ui-react-editor

## 0.1.0

### Minor Changes

- ead38f2: Standalone multi-file editing with CSS-variable theming.

  - **Breaking:** `CwlCodeEditor` no longer depends on `@theseus-cwl/parser` — it renders the files of a `CwlSource` directly as tabs.
  - **Breaking:** the bundled dark theme is replaced by `--cwl-code-editor-*` CSS-variable theming.
  - Editor extensions are configurable, file tabs are styled, and the stylesheet is exposed through the package `style` export.
  - Improved active-file detection.

### Patch Changes

- Updated dependencies [ead38f2]
- Updated dependencies [ead38f2]
  - @theseus-cwl/configurations@2.0.0
  - @theseus-cwl/types@2.0.0

## 0.0.5

### Patch Changes

- Fix lint issues and add control to CI pipeline
- Updated dependencies
  - @theseus-cwl/parser@0.0.2

## 0.0.4

### Patch Changes

- reinitialize changelogs
- Updated dependencies
  - @theseus-cwl/parser@0.0.1
