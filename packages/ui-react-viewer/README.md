# @theseus-cwl/ui-react-viewer

A React toolkit for displaying [CWL (Common Workflow Language)](https://www.commonwl.org/) workflows as interactive DAG graphs.

[![UI](https://img.shields.io/npm/v/@theseus-cwl/ui-react-viewer.png?label=@theseus-cwl/ui-react-viewer&style=flat-square)](https://www.npmjs.com/package/@theseus-cwl/ui-react-viewer)

<div align="center">
  <img src="https://raw.githubusercontent.com/Davide0097/theseus-cwl/main/.github/theseus-cwl.svg" alt="Theseus CWL logo" width="100" />
</div>

## ✨ Features

### 📊 Interactive workflow graphs

Any CWL file is rendered as interactive DAG graphs automatically (steps are topologically sorted by their data dependencies). Packed documents render the main workflow plus each subworkflow side by side.
Optional extras: a minimap, edge labels, and dashed wrapper boxes grouping inputs, steps, and outputs, dynamic coloring widget and subworkflow scaling.

<p align="center">
  <img src="https://raw.githubusercontent.com/Davide0097/theseus-cwl/main/.github/cwl-viewer-preview.png" alt="A packed CWL document rendered as a graph: the main workflow with three subworkflows laid out side by side, with wrapper boxes and a minimap" width="800" />
</p>
<p align="center">
  <em>A packed <code>$graph</code> document: the main workflow and its subworkflows, with wrappers, edge labels, and the minimap enabled.</em>
</p>

### 🔦 Hover & selection highlighting

Hovering or selecting a node emphasizes it and its connected edges while the rest of the graph is dimmed. Edges can be hovered too, revealing their label and highlighting both endpoints.

<p align="center">
  <img src="https://raw.githubusercontent.com/Davide0097/theseus-cwl/main/.github/cwl-viewer-hover-preview.png" alt="A hovered step node with its connected edges highlighted in blue while unrelated nodes are dimmed" width="800" />
</p>
<p align="center">
  <em>Hovering <code>ensemble_run</code>: its edges light up, everything unrelated fades out.</em>
</p>

### 🔍 Node inspector

Clicking a node zooms to it and opens a side panel showing its CWL definition properties (can be turned off via the `nodeInspector` prop).

<p align="center">
  <img src="https://raw.githubusercontent.com/Davide0097/theseus-cwl/main/.github/cwl-viewer-inspector-preview.png" alt="A selected step node with the inspector panel open on the right, showing the step's run, in, out, and id fields" width="800" />
</p>
<p align="center">
  <em>The inspector panel for a selected step, showing its <code>run</code>, <code>in</code>, <code>out</code>, and <code>id</code>.</em>
</p>

### And more

- 📂 **Flexible input** - accepts a parsed CWL object, a raw JSON/YAML string, or a `File`; single and multi-document sources are supported.
- 🎨 **Fully themeable** - node fill colors via `initialColorState`, an optional built-in color editor panel, and every other visual (background, borders, edges, inspector) via `--cwl-viewer-*` CSS variables (see [Styling](#-styling)).
- 📦 **Standalone** - a single React component with React as the only peer dependency.

## 🚀 Installation

```bash
npm install @theseus-cwl/ui-react-viewer
# or
yarn add @theseus-cwl/ui-react-viewer
```

The component's stylesheet ships with the package. Bundlers that handle CSS imports (Vite, webpack, …) load it automatically when you import `CwlViewer`; otherwise import it explicitly:

```tsx
import "@theseus-cwl/ui-react-viewer/style.css";
```

## 🛠 Example Usage

The CwlViewer component accepts CWL data in three forms:

- JSON object (parsed CWL, as in the example below)

- File

- String (raw JSON or YAML string)

The viewer fills its parent element (`width`/`height: 100%`), so make sure to render it inside an explicitly sized container - an unsized parent results in an empty view.

```tsx
import { CwlSource, Shape } from "@theseus-cwl/types";
import { CwlViewer } from "@theseus-cwl/ui-react-viewer";

const Example = () => {
  const source: CwlSource<Shape.Raw> = {
    entrypoint: "main",
    documents: [
      {
        name: "main",
        content: {
          cwlVersion: "v1.2",
          class: "Workflow",
          label: "Theseus CWL",
          inputs: {
            message: "string",
          },
          outputs: {
            output: {
              type: "File",
              outputSource: "echo_step/output",
            },
          },
          steps: {
            echo_step: {
              run: {
                class: "CommandLineTool",
                baseCommand: "echo",
                inputs: {
                  message: {
                    type: "string",
                    inputBinding: {
                      position: 1,
                    },
                  },
                },
                outputs: {
                  output: {
                    type: "File",
                    outputBinding: {
                      glob: "output.txt",
                    },
                  },
                },
                stdout: "output.txt",
              },
              in: {
                message: "message",
              },
              out: ["output"],
            },
          },
        },
      },
    ],
    parameters: [
      {
        name: "input.json",
        content: `{ "message": "Hello from Theseus CWL !" }`,
      },
    ],
  };

  return (
    <div style={{ height: "600px" }}>
      <CwlViewer input={source} minimap={true} wrappers={true} labels={true} />
    </div>
  );
};
```

## 🛠 API

| Prop                       | Type                                                                                     | Default                                                     | Description                                                                                           |
| -------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `input`                    | `CwlSource<Shape.Raw \| Shape.Sanitized>`                                                | `undefined`                                                 | CWL workflow source to visualize. Accepts parsed JSON/YAML objects representing a valid CWL workflow. |
| `onChange`                 | `(value: object) => void`                                                                | `console.log`                                               | Callback triggered when the workflow graph changes internally.                                        |
| `wrappers`                 | `boolean`                                                                                | `false`                                                     | Enables wrapper nodes in the graph view.                                                              |
| `minimap`                  | `boolean`                                                                                | `false`                                                     | Displays a minimap of the workflow graph.                                                             |
| `labels`                   | `boolean`                                                                                | `false`                                                     | Shows labels on graph edges.                                                                          |
| `colorEditor`              | `boolean`                                                                                | `false`                                                     | Enables the color editor panel for node types.                                                        |
| `initialColorState`        | `ColorState`                                                                             | `undefined`                                                 | Initial configuration for node colors.                                                                |
| `background`               | `Pick<BackgroundProps, "variant" \| "color" \| "bgColor" \| "style" \| "gap" \| "size">` | `{ color: "transparent", variant: BackgroundVariant.Dots }` | Configuration for the graph background.                                                               |
| `subWorkflowScalingFactor` | `number`                                                                                 | `0.8`                                                       | Scaling factor applied when rendering subworkflows.                                                   |
| `highlights`               | `boolean`                                                                                | `true`                                                      | Highlights the hovered/selected node and its connections while dimming the rest of the graph.         |
| `nodeInspector`            | `boolean`                                                                                | `true`                                                      | Opens the node inspector panel when a node is selected.                                               |

## 🎨 Styling

The viewer ships its own stylesheet and owns its whole look - the graph pane, node cards, edges, the node inspector, and the color editor overlay.

The look can be customized through **CSS variables**, declared on the viewer's root `.cwl-viewer` element:

### Viewer

| Variable          | Default   | Purpose           |
| ----------------- | --------- | ----------------- |
| `--cwl-viewer-bg` | `#fafafa` | Viewer background |

### Node cards

| Variable                                     | Default                             | Purpose                                  |
| -------------------------------------------- | ----------------------------------- | ---------------------------------------- |
| `--cwl-viewer-node-border-color`             | `#181a1faf`                         | Node card border                         |
| `--cwl-viewer-node-border-radius`            | `2px`                               | Node card corner radius                  |
| `--cwl-viewer-node-shadow`                   | `4px 4px 16px rgba(0, 0, 0, 0.171)` | Node card shadow                         |
| `--cwl-viewer-node-title-text-color`         | `#383a42`                           | Node card title                          |
| `--cwl-viewer-node-info-text-color`          | `#696c77`                           | Node card info line                      |
| `--cwl-viewer-node-icon-color`               | `#383a42`                           | Node card header icon                    |
| `--cwl-viewer-node-icon-bg`                  | `rgba(255, 255, 255, 0.356)`        | Node card header icon background         |
| `--cwl-viewer-node-icon-border-radius`       | `2px`                               | Node card header icon corner radius      |
| `--cwl-viewer-node-icon-shadow`              | `0 4px 6px rgba(0, 0, 0, 0.2)`      | Node card header icon shadow             |
| `--cwl-viewer-node-badge-bg`                 | `rgba(255, 255, 255, 0.356)`        | Node card badge background               |
| `--cwl-viewer-node-badge-text-color`         | `#383a42`                           | Node card badge text                     |
| `--cwl-viewer-node-badge-border-color`       | `rgba(0, 0, 0, 0.062)`              | Node card badge border                   |
| `--cwl-viewer-node-badge-shadow`             | `0 4px 6px rgba(0, 0, 0, 0.2)`      | Node card badge shadow                   |
| `--cwl-viewer-node-placeholder-text-color`   | `#383a42`                           | "+ New …" placeholder card text          |
| `--cwl-viewer-node-placeholder-border-color` | `#696c77`                           | "+ New …" placeholder card dashed border |
| `--cwl-viewer-wrapper-border-color`          | `#a0a1a7`                           | Dashed border of wrapper (group) nodes   |

### Edges

| Variable                             | Default                        | Purpose                   |
| ------------------------------------ | ------------------------------ | ------------------------- |
| `--cwl-viewer-edge-color`            | `#696c77`                      | Edge stroke and arrowhead |
| `--cwl-viewer-edge-label-bg`         | `#eaeaeb`                      | Edge label background     |
| `--cwl-viewer-edge-label-text-color` | `#383a42`                      | Edge label text           |
| `--cwl-viewer-edge-label-shadow`     | `0 1px 2px rgba(0, 0, 0, 0.5)` | Edge label shadow         |

### Hover / selection highlighting

Active when the `highlights` prop is enabled (the default):

| Variable                            | Default   | Purpose                                                                 |
| ----------------------------------- | --------- | ----------------------------------------------------------------------- |
| `--cwl-viewer-node-highlight-color` | `#4078f2` | Outline of the hovered/selected node; minimap tint of highlighted nodes |
| `--cwl-viewer-edge-highlight-color` | `#4078f2` | Stroke and arrowhead of highlighted edges (edges can be hovered too)    |
| `--cwl-viewer-dimmed-opacity`       | `0.25`    | Opacity of nodes/edges unrelated to the active node                     |

### Minimap

Active when the `minimap` prop is enabled:

| Variable                                 | Default                             | Purpose                                        |
| ---------------------------------------- | ----------------------------------- | ---------------------------------------------- |
| `--cwl-viewer-minimap-bg`                | `#ffffff`                           | Minimap panel background                       |
| `--cwl-viewer-minimap-mask-color`        | `rgba(240, 240, 240, 0.6)`          | Overlay covering the area outside the viewport |
| `--cwl-viewer-minimap-mask-stroke-color` | `transparent`                       | Outline of the viewport rectangle              |
| `--cwl-viewer-minimap-border-color`      | `rgba(0, 0, 0, 0.062)`              | Minimap panel border                           |
| `--cwl-viewer-minimap-border-radius`     | `2px`                               | Minimap panel corner radius                    |
| `--cwl-viewer-minimap-shadow`            | `4px 4px 16px rgba(0, 0, 0, 0.171)` | Minimap panel shadow                           |

Note: the node **fill colors** inside the minimap follow the graph's node colors (see the note below); highlighted nodes are tinted with `--cwl-viewer-node-highlight-color`.

### Node inspector

| Variable                        | Default                          | Purpose                    |
| ------------------------------- | -------------------------------- | -------------------------- |
| `--cwl-viewer-inspector-bg`     | `#f0f0f1`                        | Inspector panel background |
| `--cwl-viewer-inspector-shadow` | `-3px 0 8px rgba(0, 0, 0, 0.08)` | Inspector panel shadow     |

### Inspector forms

| Variable                                | Default                      | Purpose                     |
| --------------------------------------- | ---------------------------- | --------------------------- |
| `--cwl-viewer-form-header-text-color`   | `#383a42`                    | Form header text            |
| `--cwl-viewer-form-icon-color`          | `#383a42`                    | Form header icon            |
| `--cwl-viewer-form-icon-bg`             | `rgba(255, 255, 255, 0.356)` | Form header icon background |
| `--cwl-viewer-form-label-text-color`    | `#696c77`                    | Form field labels           |
| `--cwl-viewer-form-input-border-color`  | `#dbdbdc`                    | Form input borders          |
| `--cwl-viewer-form-button-border-color` | `#383a42`                    | Form button borders         |

### Color editor

| Variable                                              | Default       | Purpose                           |
| ----------------------------------------------------- | ------------- | --------------------------------- |
| `--cwl-viewer-color-editor-input-border-color`        | `transparent` | Color picker input borders        |
| `--cwl-viewer-color-editor-button-bg`                 | `#f0f0f1`     | Button background                 |
| `--cwl-viewer-color-editor-button-border-color`       | `transparent` | Button borders                    |
| `--cwl-viewer-color-editor-primary-button-bg`         | `#4078f2`     | Primary (Apply) button background |
| `--cwl-viewer-color-editor-primary-button-text-color` | `white`       | Primary (Apply) button text       |

Override them from your own CSS, on `.cwl-viewer` itself or any ancestor - for example a dark theme matching the default One Dark look of [`@theseus-cwl/ui-react-editor`](https://www.npmjs.com/package/@theseus-cwl/ui-react-editor):

```css
.my-app .cwl-viewer {
  --cwl-viewer-bg: #282c34;
  --cwl-viewer-node-title-text-color: #ffffff;
  --cwl-viewer-node-info-text-color: #abb2bf;
  --cwl-viewer-edge-color: #7d8799;
  --cwl-viewer-edge-label-bg: #21252b;
  --cwl-viewer-edge-label-text-color: #abb2bf;
  --cwl-viewer-minimap-bg: #21252b;
  --cwl-viewer-minimap-mask-color: rgba(40, 44, 52, 0.6);
  --cwl-viewer-inspector-bg: #21252b;
}
```

Note: the **fill colors** of input/step/output nodes are not CSS variables - they are controlled at runtime via the `initialColorState` prop, the `colorEditor` panel, or `configureTheseusCwl` (see below).

### Global configuration

Layout and default-color constants - node size and spacing, animation timing, default node fill colors, subworkflow scaling - live in [`@theseus-cwl/configurations`](https://www.npmjs.com/package/@theseus-cwl/configurations) and can be overridden once at app startup, before the viewer first renders:

```ts
import { configureTheseusCwl } from "@theseus-cwl/configurations";

configureTheseusCwl({
  NODE_WIDTH: 180,
  NODE_HEIGHT: 90,
  INPUT_NODE_COLOR: "#98c379",
});
```

## 📦 Related packages

| Package                                                                                      | Purpose                                                                 |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [`@theseus-cwl/ui-react-editor`](https://www.npmjs.com/package/@theseus-cwl/ui-react-editor) | The editing half of the toolkit - a CodeMirror-based CWL source editor. |
| [`@theseus-cwl/parser`](https://www.npmjs.com/package/@theseus-cwl/parser)                   | Parses and normalizes raw CWL sources into typed, sanitized objects.    |
| [`@theseus-cwl/types`](https://www.npmjs.com/package/@theseus-cwl/types)                     | CWL v1.2 TypeScript type definitions and the `CwlSource` input model.   |
| [`@theseus-cwl/configurations`](https://www.npmjs.com/package/@theseus-cwl/configurations)   | Shared runtime configuration (`configureTheseusCwl`).                   |

All packages are developed in the
[theseus-cwl monorepo](https://github.com/Davide0097/theseus-cwl).

## 📘 Learn More about CWL

- [Common Workflow Language (CWL)](https://www.commonwl.org/)

## 📣 Contributing

We welcome contributions! If you’d like to improve Theseus or suggest new features, open an issue or a pull request on [GitHub](https://github.com/Davide0097/theseus-cwl).

## 📄 License

MIT License © 2026 [Davide Giorgiutti](https://github.com/Davide0097)
