# @theseus-cwl/configurations

A collection of shared runtime configurations for working with [CWL (Common Workflow Language)](https://www.commonwl.org/) workflows across the Theseus-CWL ecosystem.

[![UI](https://img.shields.io/npm/v/@theseus-cwl/configurations.png?label=@theseus-cwl/configurations&style=flat-square)](https://www.npmjs.com/package/@theseus-cwl/configurations)

<div align="center">
  <img src="https://raw.githubusercontent.com/Davide0097/theseus-cwl/main/.github/theseus-cwl.svg" alt="Theseus CWL logo" width="100" />
</div>

## ✨ Features

- ⚙️ **Default values, overridable globally** - the constants used internally by the `@theseus-cwl` packages (node sizing and colors, animation timing, CWL editor keywords and debounce) can be consumed and overridden externally.
- 🔄 **Live bindings** - values are exported as mutable ES-module bindings: override one at runtime and every consumer that reads it at call time observes the new value.
- ♻️ **Resettable** - `resetTheseusCwlConfiguration()` restores every value to its built-in default.

## 🚀 Installation

```bash
npm install @theseus-cwl/configurations
# or
yarn add @theseus-cwl/configurations
```

## 🛠 Example Usage

Import constants directly to read them:

```ts
import { VIEWER_PADDING } from "@theseus-cwl/configurations";

console.log(VIEWER_PADDING);
```

Use `configureTheseusCwl` to override one or more values. Only the keys you pass are changed; everything else keeps its current value. Call it once at app startup, before the viewer/editor mounts:

```ts
import { configureTheseusCwl } from "@theseus-cwl/configurations";

configureTheseusCwl({
  NODE_WIDTH: 140,
  INPUT_NODE_COLOR: "#aabbcc",
  ANIMATION_TIME: 300,
});
```

> **Note:** if you override `NODE_HEIGHT` without also passing `NODE_WIDTH`, the width is recomputed from the new height using the golden ratio (matching the default behaviour). Pass `NODE_WIDTH` explicitly to opt out.

Restore every value to its built-in default with `resetTheseusCwlConfiguration`:

```ts
import { resetTheseusCwlConfiguration } from "@theseus-cwl/configurations";

resetTheseusCwlConfiguration();
```

## 🛠 API

Every constant is a live binding that can be overridden through `configureTheseusCwl`:

| Constant                          | Default                | Purpose                                                                |
| --------------------------------- | ---------------------- | ---------------------------------------------------------------------- |
| `ANIMATION_TIME`                  | `700`                  | Viewer animation duration (ms)                                         |
| `NODE_HEIGHT`                     | `75`                   | Viewer node card height (px)                                           |
| `NODE_WIDTH`                      | `121`                  | Viewer node card width (px, golden ratio of the height)                |
| `NODE_MARGIN`                     | `17`                   | Spacing between viewer nodes (px)                                      |
| `VIEWER_PADDING`                  | `20`                   | Padding around the viewer graph (px)                                   |
| `SUBWORKFLOW_NODE_SCALING_FACTOR` | `0.8`                  | Scale applied to subworkflow graphs                                    |
| `INPUT_NODE_COLOR`                | `#85FFC7`              | Default fill color of input nodes                                      |
| `STEP_NODE_COLOR`                 | `#FF8552`              | Default fill color of step nodes                                       |
| `OUTPUT_NODE_COLOR`               | `#297373`              | Default fill color of output nodes                                     |
| `CWL_FILE_KEYWORDS`               | 9 CWL keywords         | Keyword list used by the editor's autocompletion                       |
| `CWL_FILE_KEYWORDS_DOCUMENTATION` | docs for every keyword | Structured hover documentation (summary, spec description, references) |
| `CWL_EDITOR_ONCHANGE_DEBOUNCE_MS` | `300`                  | Debounce interval of the editor's `onChange` callback (ms)             |

Functions and types:

| Export                           | Description                                                            |
| -------------------------------- | ---------------------------------------------------------------------- |
| `configureTheseusCwl(overrides)` | Reassigns only the keys provided (`Partial<TheseusCwlConfiguration>`). |
| `resetTheseusCwlConfiguration()` | Restores every value to its built-in default.                          |
| `TheseusCwlConfiguration`        | The record of every overridable key.                                   |
| `CwlKeywordDocumentation`        | One keyword's hover docs: `{ documentation, document, references }`.   |

## 📦 Related packages

| Package                                                                                      | Purpose                                                                     |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [`@theseus-cwl/ui-react-viewer`](https://www.npmjs.com/package/@theseus-cwl/ui-react-viewer) | The visualization half of the toolkit - CWL rendered as interactive graphs. |
| [`@theseus-cwl/ui-react-editor`](https://www.npmjs.com/package/@theseus-cwl/ui-react-editor) | The editing half of the toolkit - a CodeMirror-based CWL source editor.     |
| [`@theseus-cwl/parser`](https://www.npmjs.com/package/@theseus-cwl/parser)                   | Parses and normalizes raw CWL sources into typed, sanitized objects.        |
| [`@theseus-cwl/types`](https://www.npmjs.com/package/@theseus-cwl/types)                     | CWL v1.2 TypeScript type definitions and the `CwlSource` input model.       |

All packages are developed in the
[theseus-cwl monorepo](https://github.com/Davide0097/theseus-cwl).

## 📘 Learn More about CWL

- [Common Workflow Language (CWL)](https://www.commonwl.org/)

## 📣 Contributing

We welcome contributions! If you’d like to improve Theseus or suggest new features, open an issue or a pull request on [GitHub](https://github.com/Davide0097/theseus-cwl).

## 📄 License

MIT License © 2026 [Davide Giorgiutti](https://github.com/Davide0097)
