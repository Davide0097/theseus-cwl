# @theseus-cwl/types

A collection of **common TypeScript types** shared across the `@theseus-cwl` ecosystem.  
This package provides reusable type definitions that can be imported by both **internal monorepo packages** and **external projects**.

This is not intended to be a complete CWL standard TypeScript mapping. The type definition is not identical to the one provided by the standard..

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
import { CwlSource } from "@theseus-cwl/types";
import { CwlViewer } from "@theseus-cwl/ui-react-viewer";

const Example = () => {
  const source: CwlSource = {
          entrypoint: "main",
          files: [
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
          parameters: [
            {
              name: "input",
              content: {
                message: "Hello from Theseus CWL !",
              },
            },
          ],
        };

  return <CwlViewer input={source} />;
```

The example above shows how this package can be used in a JSX component, as the internal UI package is based on React. However, the types provided by this package can also be used in plain TypeScript projects.

## When to Use

When you need access to shared type definitions used across @theseus-cwl packages.
