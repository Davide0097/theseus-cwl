# Theseus-cwl

[![npm version](https://img.shields.io/npm/v/theseus.svg)](https://www.npmjs.com/package/theseus-cwl)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Build](https://img.shields.io/github/actions/workflow/status/davide0097/theseus-cwl/ci.yml)](https://github.com/davide0097/theseus-cwl/actions)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/theseus)](https://bundlephobia.com/package/theseu-cwl)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

> 🧭 Visualize, Edit, and Navigate CWL Workflows Like a Hero.

![example image](apps/cwl/public/vite.svg)

Powered by React Flow, it provides an intuitive graph interface that helps users visualize and solve complex workflows — just like Theseus finding his way through the labyrinth.

**Theseus-cwl** is a powerful, React-based library for building, editing, and navigating [Common Workflow Language (CWL)](https://www.commonwl.org/) workflows. Inspired by the mythical Theseus navigating the labyrinth, this tool lets developers and scientists visualize and solve complex workflow structures with ease.

Built on top of [React Flow](https://reactflow.dev/), Theseus brings a modern, interactive graph interface to the world of data pipelines and reproducible research.

---

## ✨ Features

- 🧩 **Visual Graph Editor** – Build and modify CWL workflows as an interactive graph
- 🛠️ **Drag-and-Drop Editing** – Add or remove steps, inputs, and outputs intuitively
- 🔍 **Dependency Visualization** – Understand how each workflow step connects and depends on others
- 🔁 **Live Workflow Validation** – Validate and update CWL structure in real time
- 🧬 **Extensible Architecture** – Easily integrate with custom CWL tools, services, or platforms

---

## 📦 Installation

```bash
npm install theseus-cwl
# or
yarn add theseus-cwl
# or
pnpm add theseus-cwl
```

---

## 📦 Monorepo Structure

This Turborepo includes:

### Apps

- `cwl`: The main app with the examples

---

## 🛠 Example Usage

```tsx
import { CWLObject } from "@theseus-cwl/types";
import { CwlEditor } from "@theseus-cwl/components";

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

  const handleOnChange = (value: object) => {
    console.log(value);
  };

  return <CwlEditor readonly={false} input={cwlObject} onChange={handleOnChange} />;
};
```

Theseus accepts valid CWL JSON/YAML objects and renders an editable graph that reflects the current state of the workflow.

---

## 🧠 Why Theseus?

Managing CWL workflows as raw text can be daunting—especially as they grow in complexity. Theseus helps you:

- Understand dependencies visually
- Edit with confidence through real-time validation
- Focus on the science, not the syntax

---

## 📘 Learn More

- [Common Workflow Language (CWL)](https://www.commonwl.org/)

---

## 📣 Contributing

We welcome contributions! If you’d like to improve Theseus or suggest new features, check out our [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## 📄 License

MIT License © 2025 [Your Name or Organization]

---
