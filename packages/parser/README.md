# @theseus-cwl/parser

The parsing and normalization layer for [CWL (Common Workflow Language)](https://www.commonwl.org/) sources inside the Theseus-CWL ecosystem.

[![UI](https://img.shields.io/npm/v/@theseus-cwl/parser.png?label=@theseus-cwl/parser&style=flat-square)](https://www.npmjs.com/package/@theseus-cwl/parser)

<div align="center">
  <img src="https://raw.githubusercontent.com/Davide0097/theseus-cwl/main/.github/theseus-cwl.svg" alt="Theseus CWL logo" width="100" />
</div>

## ✨ Features

- 📝 **Parse & normalize** - raw JSON/YAML strings, `File`s, and parsed objects all become one consistent.
- 🛡 **Strict validation** - malformed input throws an error naming the offending document instead of being silently repaired.
- 📦 **Standalone** - no React or DOM dependency; usable in Node or the browser. It is used internally by [`@theseus-cwl/ui-react-viewer`](https://www.npmjs.com/package/@theseus-cwl/ui-react-viewer) and [`@theseus-cwl/ui-react-editor`](https://www.npmjs.com/package/@theseus-cwl/ui-react-editor), but can also be used independently.

## 🚀 Installation

```bash
npm install @theseus-cwl/parser
# or
yarn add @theseus-cwl/parser
```

## 🛠 Example Usage

```tsx
import { CwlSource, Shape } from "@theseus-cwl/types";
import { CWLSourceHolder } from "@theseus-cwl/parser";

const source: CwlSource<Shape.Raw> = {...};

const holder = await CWLSourceHolder.create(source);

console.log(holder.source); // the fully sanitized CwlSource
console.log(holder.activeFile); // the entrypoint document's content
```

## 🛠 API

| Export                                 | Type                                                               | Description                                                                                                                                                                   |
| -------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CWLSourceHolder.create(source)`       | `(source: CwlSource) => Promise<CWLSourceHolder>`                  | Async factory (reads `File` contents) that parses and sanitizes every document and parameter of the source. The constructor is private - always build instances via `create`. |
| `CWLSourceHolder.prototype.source`     | `CwlSource<Shape.Sanitized>` (readonly)                            | The fully sanitized source, with every document preserved.                                                                                                                    |
| `CWLSourceHolder.prototype.activeFile` | `Workflow \| CWLPackedDocument \| Process \| undefined` (readonly) | The content of the document whose `name` matches `source.entrypoint`, or `undefined` when no document matches.                                                                |
| `isPackedDocument(object)`             | type guard                                                         | `true` when the object is a packed `$graph` document.                                                                                                                         |
| `isWorkflow(object)`                   | type guard                                                         | `true` when the object's `class` is `"Workflow"`.                                                                                                                             |

## 📦 Related packages

| Package                                                                                      | Purpose                                                                     |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [`@theseus-cwl/ui-react-viewer`](https://www.npmjs.com/package/@theseus-cwl/ui-react-viewer) | The visualization half of the toolkit - CWL rendered as interactive graphs. |
| [`@theseus-cwl/ui-react-editor`](https://www.npmjs.com/package/@theseus-cwl/ui-react-editor) | The editing half of the toolkit - a CodeMirror-based CWL source editor.     |
| [`@theseus-cwl/types`](https://www.npmjs.com/package/@theseus-cwl/types)                     | CWL v1.2 TypeScript type definitions and the `CwlSource` input model.       |
| [`@theseus-cwl/configurations`](https://www.npmjs.com/package/@theseus-cwl/configurations)   | Shared runtime configuration (`configureTheseusCwl`).                       |

All packages are developed in the
[theseus-cwl monorepo](https://github.com/Davide0097/theseus-cwl).

## 📘 Learn More about CWL

- [Common Workflow Language (CWL)](https://www.commonwl.org/)

## 📣 Contributing

We welcome contributions! If you’d like to improve Theseus or suggest new features, open an issue or a pull request on [GitHub](https://github.com/Davide0097/theseus-cwl).

## 📄 License

MIT License © 2026 [Davide Giorgiutti](https://github.com/Davide0097)
