import { CwlSource, Shape } from "@theseus-cwl/types";

export const object: CwlSource<Shape.Raw> = {
  entrypoint: "document.cwl",
  documents: [
    {
      name: "document.cwl",
      content: {
        cwlVersion: "v1.2",
        class: "CommandLineTool",
        baseCommand: "echo",
        inputs: {
          text: {
            type: "string",
            inputBinding: {
              position: 1,
            },
          },
        },
        outputs: {
          out: {
            type: "File",
            outputBinding: {
              glob: "result.txt",
            },
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
class: CommandLineTool
baseCommand: echo
inputs:
  text:
    type: string
    inputBinding:
      position: 1
outputs:
  out:
    type: File
    outputBinding:
      glob: result.txt`,
    },
  ],
  parameters: [],
};

export const source3 = { object, string };
