import { CwlSource, Shape } from "@theseus-cwl/types";

export const object: CwlSource<Shape.Raw> = {
  entrypoint: "document.cwl",
  documents: [
    {
      name: "document.cwl",
      content: {
        cwlVersion: "v1.2",
        class: "Workflow",
        inputs: {
          message: {
            type: "string",
          },
        },
        steps: {
          echo: {
            run: "echo.cwl",
            in: {
              message: "message",
            },
            out: ["output"],
          },
        },
        outputs: {
          result: {
            type: "File",
            outputSource: "echo/output",
          },
        },
      },
    },
  ],
  parameters: [],
};

export const string: CwlSource<Shape.Raw> = {
  entrypoint: "document.cwl",
  documents: [
    {
      name: "document.cwl",
      content: `cwlVersion: v1.2
class: Workflow
inputs:
  message:
    type: string
steps:
  echo:
    run: echo.cwl
    in:
      message: message
    out: [output]
outputs:
  result:
    type: File
    outputSource: echo/output`,
    },
  ],
  parameters: [],
};

export const source2 = { object, string };
