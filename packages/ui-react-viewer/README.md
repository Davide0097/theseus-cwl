# @theseus-cwl/ui-react-viewer

A React toolkit for displaying [CWL (Common Workflow Language)](https://www.commonwl.org/) workflows as interactive DAG graphs.

[![UI](https://img.shields.io/npm/v/@theseus-cwl/ui-react-viewer.png?label=@theseus-cwl/ui-react-viewer&style=flat-square)](https://www.npmjs.com/package/@theseus-cwl/ui-react-viewer)

<div align="center">
  <img src="../../apps/landing-page/public/theseus-cwl.svg" alt="Theseus CWL logo" width="100" />
</div>

## ✨ Features

![viewer-preview](../../.github/viewer-preview.png)

- 🔍 Visualize CWL workflows as interactive graphs
- 📂 Flexible API: Supports JSON, YAML, or parsed objects
- Can be used as a standalone package

## 🚀 Installation

```bash
npm install @theseus-cwl/ui-react-viewer
# or
yarn add @theseus-cwl/ui-react-viewer
```

## 🛠 Example Usage

The CwlViewer component accepts CWL data in three forms:

- JSON object (parsed CWL, as in the example below)

- File

- String (raw JSON or YAML string)

```tsx
import { CwlSource } from "@theseus-cwl/types";
import { CwlViewer } from "@theseus-cwl/ui-react-viewer";

const Example = () => {
  const source: CwlSource = {
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
    inputs: [
      {
        name: "input",
        content: {
          message: "Hello from Theseus CWL !",
        },
      },
    ],
  };

  return (
    <CwlViewer input={source} minimap={true} wrappers={true} labels={true} />
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

- [Common Workflow Language (CWL)](https://www.commonwl.org/)

## 📣 Contributing

We welcome contributions! If you’d like to improve Theseus or suggest new features.

## 📄 License

MIT License © 2026 [Davide Giorgiutti]
