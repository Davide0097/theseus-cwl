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

The editor ships its own stylesheet and owns its whole look — tabs, the
CodeMirror editor chrome, and syntax highlighting.

The look can be customized through **CSS variables**, declared on the editor's
root `.cwl-code-editor-wrapper` element:

### Tabs

| Variable                                       | Default    | Purpose                 |
| ---------------------------------------------- | ---------- | ----------------------- |
| `--cwl-code-editor-tabs-bg`                    | `#21252b`  | Tab bar background      |
| `--cwl-code-editor-tabs-border-color`          | `#181a1f`  | Tab bar bottom border   |
| `--cwl-code-editor-tab-text-color`             | `#7d8799`  | Inactive tab text       |
| `--cwl-code-editor-tab-hover-text-color`       | `#abb2bf`  | Hovered tab text        |
| `--cwl-code-editor-tab-hover-bg`               | `#2c313a`  | Hovered tab background  |
| `--cwl-code-editor-tab-active-text-color`      | `#ffffff`  | Selected tab text       |
| `--cwl-code-editor-tab-active-bg`              | `#282c34`  | Selected tab background |
| `--cwl-code-editor-tab-active-indicator-color` | `#61afef`  | Selected tab underline  |
| `--cwl-code-editor-tab-font-size`              | `13px`     | Tab label font size     |
| `--cwl-code-editor-tab-padding`                | `8px 16px` | Tab padding             |

### Editor

| Variable                                             | Default     | Purpose                                        |
| ---------------------------------------------------- | ----------- | ---------------------------------------------- |
| `--cwl-code-editor-bg`                               | `#282c34`   | Editor background                              |
| `--cwl-code-editor-text-color`                       | `#abb2bf`   | Default text color                             |
| `--cwl-code-editor-caret-color`                      | `#528bff`   | Cursor / caret                                 |
| `--cwl-code-editor-selection-bg`                     | `#3e4451`   | Selected text background                       |
| `--cwl-code-editor-active-line-bg`                   | `#6699ff0b` | Active line background                         |
| `--cwl-code-editor-selection-match-bg`               | `#aafe661a` | Other occurrences of the selected text         |
| `--cwl-code-editor-search-match-bg`                  | `#72a1ff59` | Search match background                        |
| `--cwl-code-editor-search-match-outline-color`       | `#457dff`   | Search match outline                           |
| `--cwl-code-editor-search-match-selected-bg`         | `#6199ff2f` | Currently selected search match                |
| `--cwl-code-editor-matching-bracket-bg`              | `#bad0f847` | Matching bracket background                    |
| `--cwl-code-editor-gutter-bg`                        | `#282c34`   | Line number / fold gutter background           |
| `--cwl-code-editor-gutter-text-color`                | `#7d8799`   | Gutter text (line numbers)                     |
| `--cwl-code-editor-gutter-active-line-bg`            | `#2c313a`   | Gutter cell of the active line                 |
| `--cwl-code-editor-fold-placeholder-text-color`      | `#dddddd`   | Collapsed-fold placeholder (`…`)               |
| `--cwl-code-editor-panels-bg`                        | `#21252b`   | Panels (e.g. the Mod-F search panel)           |
| `--cwl-code-editor-panels-text-color`                | `#abb2bf`   | Panel text                                     |
| `--cwl-code-editor-panels-border-color`              | `#000000`   | Panel border towards the editor                |
| `--cwl-code-editor-autocomplete-bg`                  | `#353a42`   | Editor popups (autocompletion list, tooltips)  |
| `--cwl-code-editor-autocomplete-selected-bg`         | `#2c313a`   | Selected autocompletion entry                  |
| `--cwl-code-editor-autocomplete-selected-text-color` | `#abb2bf`   | Selected autocompletion entry text             |

### Syntax highlighting

| Variable                                        | Default   | Purpose                                  |
| ----------------------------------------------- | --------- | ---------------------------------------- |
| `--cwl-code-editor-syntax-property-color`       | `#e06c75` | Mapping keys                             |
| `--cwl-code-editor-syntax-string-color`         | `#98c379` | Quoted strings                           |
| `--cwl-code-editor-syntax-string-special-color` | `#56b6c2` | Block literal headers (`\|`, `>`)        |
| `--cwl-code-editor-syntax-comment-color`        | `#7d8799` | Comments                                 |
| `--cwl-code-editor-syntax-meta-color`           | `#7d8799` | Document markers (`---`, `...`)          |
| `--cwl-code-editor-syntax-keyword-color`        | `#c678dd` | Directives (`%YAML`)                     |
| `--cwl-code-editor-syntax-type-color`           | `#e5c07b` | Tags (`!!str`)                           |
| `--cwl-code-editor-syntax-label-color`          | `#61afef` | Anchors and aliases (`&a`, `*a`)         |
| `--cwl-code-editor-syntax-punctuation-color`    | `#abb2bf` | Separators and brackets (`:`, `-`, `,`)  |

### Tooltip (CWL hover documentation)

| Variable                                | Default   | Purpose             |
| --------------------------------------- | --------- | ------------------- |
| `--cwl-code-editor-tooltip-bg`          | `#222`    | Tooltip background  |
| `--cwl-code-editor-tooltip-text-color`  | `#ffffff` | Tooltip text        |
| `--cwl-code-editor-tooltip-link-color`  | `#8ab4f8` | Reference links     |
| `--cwl-code-editor-tooltip-max-width`   | `400px`   | Tooltip max width   |

Override them from your own CSS, on `.cwl-code-editor-wrapper` itself or any
ancestor:

```css
.my-app .cwl-code-editor-wrapper {
  --cwl-code-editor-bg: #1a1a2e;
  --cwl-code-editor-syntax-property-color: #ff8552;
  --cwl-code-editor-tabs-bg: #1a1a2e;
}
```

## 📘 Learn More about CWL

- [Common Workflow Language (CWL)](https://www.commonwl.org/)

## 📣 Contributing

We welcome contributions! If you’d like to improve Theseus or suggest new features.

## 📄 License

MIT License © 2026 [Davide Giorgiutti]
