# @theseus-cwl/ui-react-editor

A React toolkit for displaying [CWL (Common Workflow Language)](https://www.commonwl.org/) source files.

[![UI](https://img.shields.io/npm/v/@theseus-cwl/ui-react-editor.png?label=@theseus-cwl/ui-react-editor&style=flat-square)](https://www.npmjs.com/package/@theseus-cwl/ui-react-editor)

<div align="center">
  <img src="../../apps/landing-page/public/theseus-cwl.svg" alt="Theseus CWL logo" width="100" />
</div>

## ✨ Features

<div align="center">
  <img src="../../.github/code-editor-preview.png" alt="Theseus CWL code editor preview" width="400" />
</div>

- 📝 Edit CWL definitions in a code editor interface with YAML syntax highlighting, CWL keyword autocompletion, and hover documentation
- 📂 Renders every file of a `CwlSource` - documents and input parameters - as switchable tabs

## 🚀 Installation

```bash
npm install @theseus-cwl/ui-react-editor
# or
yarn add @theseus-cwl/ui-react-editor
```

## 🛠 Example Usage

The editor receives a `CwlSource` and renders each of its files - documents and parameters - as a tab.

File content is shown as text: **strings** pass through verbatim, **parsed JSON objects** are serialized to YAML, and **File** contents are read asynchronously.

The editor does **no** parsing or validation — those are the consuming application's responsibility (see `@theseus-cwl/parser`).

```tsx
import { CwlSource, Shape } from "@theseus-cwl/types";
import { CwlCodeEditor } from "@theseus-cwl/ui-react-editor";

const Example = () => {
  const source: CwlSource<Shape.Raw> = {
    entrypoint: "main.cwl",
    documents: [
      {
        name: "main.cwl",
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
    <CwlCodeEditor input={source} onChange={(value) => console.log(value)} />
  );
};
```

Props:

| Prop                        | Type                         | Default | Description                                                                                        |
| --------------------------- | ---------------------------- | ------- | -------------------------------------------------------------------------------------------------- |
| `input`                     | `CwlSource`                  | —       | CWL source whose documents and parameters are rendered as file tabs                                |
| `onChange`                  | `(value: CwlSource) => void` | —       | Debounced callback fired with the updated source (edited text replaces the active file's content)  |
| `readOnly`                  | `boolean`                    | `false` | Render the editor in read-only mode                                                                |
| `wrap`                      | `boolean`                    | `true`  | Wrap long lines                                                                                    |
| `enableCwlAutoCompletion`   | `boolean`                    | `true`  | CWL keyword autocompletion (only active on CWL document tabs, not parameter files)                 |
| `enableCwlHoverTooltip`     | `boolean`                    | `true`  | Hover documentation for CWL keywords (only active on CWL document tabs, not parameter files)       |
| `enableLineNumbers`         | `boolean`                    | `true`  | Show the line number gutter                                                                        |
| `enableCodeFolding`         | `boolean`                    | `true`  | Show the code folding gutter (collapses nested YAML blocks)                                        |
| `enableSearch`              | `boolean`                    | `true`  | Search panel (Mod-F) and highlighting of other occurrences of the selection                        |
| `enableBracketMatching`     | `boolean`                    | `true`  | Highlight matching brackets and auto-close brackets/quotes while typing                            |
| `enableHighlightActiveLine` | `boolean`                    | `true`  | Highlight the line the cursor is on (content and gutter)                                           |
| `tabSize`                   | `number`                     | `2`     | Number of spaces per indentation level                                                             |
| `fontSize`                  | `number`                     | —       | Font size in pixels of the editor content and gutters (inherits the surrounding size when omitted) |

## 🎨 Styling

The editor ships its own stylesheet.

The look is customized through **CSS variables**: colors and dimensions are exposed as a CSS custom property, declared on the editor's root
`.cwl-code-editor-wrapper` element:

| Variable                                       | Default    | Purpose                             |
| ---------------------------------------------- | ---------- | ----------------------------------- |
| `--cwl-code-editor-tabs-bg`                    | `#21252b`  | Tab bar background                  |
| `--cwl-code-editor-tabs-border-color`          | `#181a1f`  | Tab bar bottom border               |
| `--cwl-code-editor-tab-color`                  | `#7d8799`  | Inactive tab text                   |
| `--cwl-code-editor-tab-hover-color`            | `#abb2bf`  | Hovered tab text                    |
| `--cwl-code-editor-tab-hover-bg`               | `#2c313a`  | Hovered tab background              |
| `--cwl-code-editor-tab-active-color`           | `#ffffff`  | Selected tab text                   |
| `--cwl-code-editor-tab-active-bg`              | `#282c34`  | Selected tab background             |
| `--cwl-code-editor-tab-active-indicator-color` | `#61afef`  | Selected tab underline + focus ring |
| `--cwl-code-editor-tab-font-size`              | `13px`     | Tab label font size                 |
| `--cwl-code-editor-tab-padding`                | `8px 16px` | Tab padding                         |

Override them from your own CSS, on `.cwl-code-editor-wrapper` itself or any
ancestor:

```css
.my-app .cwl-code-editor-wrapper {
  --cwl-code-editor-tab-active-indicator-color: #ff8552;
  --cwl-code-editor-tabs-bg: #1a1a2e;
}
```

## 📘 Learn More about CWL

- [Common Workflow Language (CWL)](https://www.commonwl.org/)

## 📣 Contributing

We welcome contributions! If you’d like to improve Theseus or suggest new features.

## 📄 License

MIT License © 2026 [Davide Giorgiutti]
