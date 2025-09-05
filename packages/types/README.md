# @theseus-cwl/types

A collection of **common TypeScript types** shared across the `@theseus-cwl` ecosystem.  
This package provides reusable type definitions that can be imported by both **internal monorepo packages** and **external projects**.

## Installation

```bash
npm install @theseus-cwl/types
# or
pnpm add @theseus-cwl/types
# or
yarn add @theseus-cwl/types
```

## Usage

```ts
import { CWLObject } from '@theseus-cwl/types';
import { CwlViewer } from '@theseus-cwl/ui';

const cwlObject: CWLObject = {
  cwlVersion: "v1.0",
  class: "Workflow",
  inputs: {
    num1: { type: "int" },
    num2: { type: "int" },
    multiplier: { type: "int" },
  },
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
  outputs: {
    final_result: {
      type: "int",
      outputSource: "multiply/result",
    },
  },
};

export const Example = () => {
  return (
    <CwlViewer
      input={cwlObject}
      // other props here
    />
  );
}
```

The example above shows how this package can be used in a JSX component, as the internal UI package is based on React. However, the types provided by this package can also be used in plain TypeScript projects.

## When to Use

When you need access to shared type definitions used across @theseus-cwl packages.
