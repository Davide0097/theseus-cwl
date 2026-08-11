# @theseus-cwl/ui-react-viewer

## 2.0.3

### Patch Changes

- 1060ed2: Make the node card background opacity configurable
- b65b89c: Restore the node type badge for subworkflow output nodes
- 3e65c25: Style the React Flow attribution badge with a high-contrast black background
- 2b986ee: Themeable inspector form elements (input and text area) via CSS variables
- 2f485e6: Fix the minimap not tinting the highlighted node
- 85edc49: Remove unused import and add default background value
- fea2b43: Themeable color editor panel (background, border, button text) via CSS variables, and gradient support for viewer, inspector, and minimap backgrounds
- e26ddde: Make the graph background opt-in and expose its configuration type
- Updated dependencies [0b041a4]
  - @theseus-cwl/configurations@2.0.1

## 2.0.2

### Patch Changes

- 4be4f81: Themeable fonts via CSS variables
- de503e7: Add minimap style override support
- feffe53: Themeable File/Directory badge via CSS variables
- cb6c5cb: Inspector forms no longer overflow the panel width, the inspector scrolls only vertically and the header icon doesn't shrink

## 2.0.1

### Patch Changes

- a7f5b7a: Fix process workflow wrapper node
- 1037349: Add nodeInspector prop to toggle the inspector panel
- 4b5fb80: Add jsdoc to CwlViewer
- d9d5d90: Fix isSubWorkflow not being applied to CommandLineTool subworkflow nodes and shows node badge for subworkflow nodes

## 2.0.0

### Major Changes

- ead38f2: CSS-variable theming, hover highlights, `Process` rendering — and a slimmer, ESM-only package.

  - **Breaking:** the package is now published as ESM-only; CommonJS `require()` is no longer supported.
  - **Breaking:** the package entry now exports only the stable public API: `CwlViewer`, `CwlViewerProps`, and `ColorState`. Previously reachable internals (hooks, contexts, node components, init utilities) are no longer exported.
  - The viewer is themeable via `--cwl-viewer-*` CSS variables, and the stylesheet is exposed through the package `style` export.
  - New `highlights` prop (default on): hovering or selecting a node or edge highlights its connections and dims the rest of the graph.
  - Standalone `Process` documents (e.g. `CommandLineTool`) are now rendered, not just workflows.
  - Packed `$graph` documents: step `run` references are resolved by fragment id, and a tool named `main` no longer shadows the entry workflow.
  - Fixes: array `outputSource` handling, stray step-to-step edges, minimap node visibility, and color editor reset.

### Patch Changes

- Updated dependencies [ead38f2]
- Updated dependencies [ead38f2]
  - @theseus-cwl/configurations@2.0.0
  - @theseus-cwl/parser@0.1.0

## 1.1.3

### Patch Changes

- Fix lint issues and add control to CI pipeline
- Updated dependencies
  - @theseus-cwl/configurations@1.1.2
  - @theseus-cwl/parser@0.0.2

## 1.1.2

### Patch Changes

- reinitialize changelogs
- Updated dependencies
  - @theseus-cwl/configurations@1.1.1
  - @theseus-cwl/parser@0.0.1
