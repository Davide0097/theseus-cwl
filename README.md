# Theseus-cwl

A React toolkit for displaying [CWL (Common Workflow Language)](https://www.commonwl.org/) workflows as interactive graphs.

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
  - String containing CWL JSON/YAML

## 🚀 Installation

```bash
npm install @theseus-cwl/ui @theseus-cwl/types
# or
yarn add @theseus-cwl/ui @theseus-cwl/types
```

## 🛠 Example Usage

The CwlViewer component accepts CWL data in three forms:

- JSON object (parsed CWL, as in the example below)

- File (provided via input)

- String (raw JSON or YAML text)

```tsx
import { CWLObject } from "@theseus-cwl/types";
import { CwlViewer } from "@theseus-cwl/components";

export const Example = () => {
  const cwlObject: CWLObject = {
    cwlVersion: "v1.0",
    class: "Workflow",
    inputs: [
      { id: "num1", content: { type: "int" } },
      { id: "num2", content: { type: "int" } },
      { id: "multiplier", content: { type: "int" } },
    ],
    steps: [
      {
        id: "add",
        content: {
          run: "../math/add.cwl",
          in: {
            a: { source: "num1" },
            b: { source: "num2" },
          },
          out: "sum",
        },
      },
      {
        id: "multiply",
        content: {
          run: "../math/multiply.cwl",
          in: {
            number: { source: "add/sum" },
            multiplier: { source: "multiplier" },
          },
          out: "result",
        },
      },
    ],
    outputs: [
      {
        id: "final_result",
        content: {
          type: "int",
          outputSource: "multiply/result",
        },
      },
    ],
  };

  return <CwlViewer input={cwlObject} />;
};
```

Theseus accepts valid CWL JSON/YAML objects and renders an editable graph that reflects the current state of the workflow.

## 📦 Monorepo Structure

This repository includes:

### Apps

- `test`: App with some tests.
- `landing-page`: The project landing page.

### Packages

- [@theseus-cwl/ui](./packages/ui) React graph editor for CWL.
- [@theseus-cwl/types](./packages/types) CWL object type definitions.

### Internal packages

- [@theseus-cwl/configurations](./packages/configurations)
- [@theseus-cwl/typescript-config](./packages/typescript-config)
- [@theseus-cwl/eslint-config](./packages/eslint-config)

## 📘 Learn More

- [Common Workflow Language (CWL)](https://www.commonwl.org/)

## 📣 Contributing

We welcome contributions! If you’d like to improve Theseus or suggest new features.

## 📄 License

MIT License © 2025 [Davide Giorgiutti]
