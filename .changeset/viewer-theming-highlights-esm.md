---
"@theseus-cwl/ui-react-viewer": major
---

CSS-variable theming, hover highlights, `Process` rendering — and a slimmer, ESM-only package.

- **Breaking:** the package is now published as ESM-only; CommonJS `require()` is no longer supported.
- **Breaking:** the package entry now exports only the stable public API: `CwlViewer`, `CwlViewerProps`, and `ColorState`. Previously reachable internals (hooks, contexts, node components, init utilities) are no longer exported.
- The viewer is themeable via `--cwl-viewer-*` CSS variables, and the stylesheet is exposed through the package `style` export.
- New `highlights` prop (default on): hovering or selecting a node or edge highlights its connections and dims the rest of the graph.
- Standalone `Process` documents (e.g. `CommandLineTool`) are now rendered, not just workflows.
- Packed `$graph` documents: step `run` references are resolved by fragment id, and a tool named `main` no longer shadows the entry workflow.
- Fixes: array `outputSource` handling, stray step-to-step edges, minimap node visibility, and color editor reset.
