# @theseus-cwl/types

A collection of common TypeScript types for working with [CWL (Common Workflow Language)](https://www.commonwl.org/) workflows.
This package provides reusable type definitions that can be imported by both **internal monorepo packages** and **external projects**.

[![UI](https://img.shields.io/npm/v/@theseus-cwl/types.png?label=@theseus-cwl/types&style=flat-square)](https://www.npmjs.com/package/@theseus-cwl/types)

<div align="center">
  <img src="https://raw.githubusercontent.com/Davide0097/theseus-cwl/main/.github/theseus-cwl.svg" alt="Theseus CWL logo" width="100" />
</div>

## ✨ Features

- 🧩 **CWL v1.2 model** - `Workflow`, `CommandlineTool`, `ExpressionTool`, packed `$graph` documents (`CWLPackedDocument`), steps, inputs, and outputs.
- 📂 **The `CwlSource` input model** - the document/parameter envelope that the viewer, editor, and parser all consume.
- 🔀 **Raw vs Sanitized shapes** - most types are generic over the `Shape` enum, so the same name describes both the loose form an author writes and the normalized form the parser produces.
- 📦 **Type-only** - no runtime code (the `Shape` enum is the only value export); usable from React components and plain TypeScript projects alike.

Note: this is not intended to be a complete CWL standard TypeScript mapping - the type definitions are intentionally narrowed to what the Theseus tooling needs.

## 🚀 Installation

```bash
npm install @theseus-cwl/types
# or
yarn add @theseus-cwl/types
```

## 🛠 Example Usage

```tsx
import { CwlSource, Shape } from "@theseus-cwl/types";
import { CwlViewer } from "@theseus-cwl/ui-react-viewer";

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
                  inputBinding: { position: 1 },
                },
              },
              outputs: {
                output: {
                  type: "File",
                  outputBinding: { glob: "output.txt" },
                },
              },
              stdout: "output.txt",
            },
            in: { message: "message" },
            out: ["output"],
          },
        },
      },
    },
  ],
  // A parameter's `content` is a string | File | undefined (e.g. a job/params file body)
  parameters: [
    {
      name: "input",
      content: JSON.stringify({ message: "Hello from Theseus CWL !" }),
    },
  ],
};

const Example = () => <CwlViewer input={source} />;
```

The example above shows how this package can be used in a JSX component, as the internal UI package is based on React. However, the types provided by this package can also be used in plain TypeScript projects.

## 🛠 API

All symbols are imported from the package root:

| Export                                                     | Description                                                                                           |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `CwlSource`, `CwlSourceDocument`, `CwlSourceParameter`     | The input envelope: an entrypoint plus documents and parameter files.                                 |
| `Shape`                                                    | Enum discriminator (`Raw` \| `Sanitized`) that most types are generic over.                           |
| `Process`, `Workflow`, `CommandlineTool`, `ExpressionTool` | The CWL process classes.                                                                              |
| `CWLPackedDocument`                                        | A packed `$graph` document bundling several processes.                                                |
| `Input`, `ExtendedInput`, `Output`, `WorkflowOutput`       | Input/output parameter shapes.                                                                        |
| `WorkflowStep`, `WorkflowStepInput`, `WorkflowStepOutput`  | Workflow step shapes.                                                                                 |
| `Type`, `CWLVersion`, `Expression`                         | CWL value-type strings, the supported CWL version (`"v1.2"`), and the runtime-expression placeholder. |

## 📦 Related packages

| Package                                                                                      | Purpose                                                                     |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [`@theseus-cwl/ui-react-viewer`](https://www.npmjs.com/package/@theseus-cwl/ui-react-viewer) | The visualization half of the toolkit - CWL rendered as interactive graphs. |
| [`@theseus-cwl/ui-react-editor`](https://www.npmjs.com/package/@theseus-cwl/ui-react-editor) | The editing half of the toolkit - a CodeMirror-based CWL source editor.     |
| [`@theseus-cwl/parser`](https://www.npmjs.com/package/@theseus-cwl/parser)                   | Parses and normalizes raw CWL sources into typed, sanitized objects.        |
| [`@theseus-cwl/configurations`](https://www.npmjs.com/package/@theseus-cwl/configurations)   | Shared runtime configuration (`configureTheseusCwl`).                       |

All packages are developed in the
[theseus-cwl monorepo](https://github.com/Davide0097/theseus-cwl).

## 📘 Learn More about CWL

- [Common Workflow Language (CWL)](https://www.commonwl.org/)

## 📣 Contributing

We welcome contributions! If you’d like to improve Theseus or suggest new features, open an issue or a pull request on [GitHub](https://github.com/Davide0097/theseus-cwl).

## 📄 License

MIT License © 2026 [Davide Giorgiutti](https://github.com/Davide0097)
