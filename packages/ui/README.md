# @theseus-cwl/ui

A React toolkit for displaying [CWL (Common Workflow Language)](https://www.commonwl.org/) workflows as interactive DAG graphs.

[![UI](https://img.shields.io/npm/v/@theseus-cwl/ui.png?label=@theseus-cwl/ui&style=flat-square)](https://www.npmjs.com/package/@theseus-cwl/ui)
[![Types](https://img.shields.io/npm/v/@theseus-cwl/types.png?label=@theseus-cwl/types&style=flat-square)](https://www.npmjs.com/package/@theseus-cwl/types)

<p align="center">
  <img src="./apps/cwl/public/theseus-cwl.svg" alt="example image" width="120" />
</p>

## ✨ Features

- 🔍 Visualize CWL workflows as interactive graphs
- 📂 Flexible input: accepts CWL as
  - JSON
  - File
  - String containing CWL (JSON/YAML)

## 🚀 Installation

```bash
npm install @theseus-cwl/ui
# or
yarn add @theseus-cwl/ui
```

## 🛠 Example Usage

The CwlViewer component accepts CWL data in three forms:

- JSON object (parsed CWL, as in the example below)

- File (provided via input)

- String (raw JSON or YAML text)

```tsx
import { Workflow } from "@theseus-cwl/types";
import { CwlViewer } from "@theseus-cwl/ui";

export const Example = () => {
  const workflow: Workflow = {
    cwlVersion: "v1.2",
    class: "Workflow",
    inputs: {
      num1: {
        type: "int",
      },
      num2: {
        type: "int",
      },
      multiplier: {
        type: "int",
      },
    },
    steps: {
      add: {
        run: "../math/add.cwl",
        in: {
          a: { source: "num1" },
          b: { source: "num2" },
        },
        out: "sum",
      },
      multiply: {
        run: "../math/multiply.cwl",
        in: {
          number: { source: "add/sum" },
          multiplier: { source: "multiplier" },
        },
        out: "result",
      },
    },
    outputs: {
      final_result: {
        type: "int",
        outputSource: "multiply/result",
      },
    },
  };

  return (
    <CwlViewer
      input={workflow}
      wrappers={wrappers}
      minimap={minimap}
      colorEditor={colorEditor}
      initialColorState={initialColors}
      labels={labels}
    />
  );
};
```

Theseus accepts valid CWL JSON/YAML objects and renders a graph that reflects the current state of the workflow.

- [Common Workflow Language (CWL)](https://www.commonwl.org/)

## 📣 Contributing

We welcome contributions! If you’d like to improve Theseus or suggest new features.

## 📄 License

MIT License © 2025 [Davide Giorgiutti]
