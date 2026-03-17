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
          message: { type: "string" },
        },
        outputs: {
          final: {
            type: "File",
            outputSource: "step3/out",
          },
        },
        steps: {
          step1: {
            run: {
              class: "CommandLineTool",
              baseCommand: "echo",
              inputs: {
                text: {
                  type: "string",
                  inputBinding: { position: 1 },
                },
              },
              outputs: {
                out: {
                  type: "File",
                  outputBinding: {
                    glob: "s1.txt",
                  },
                },
              },
            },
            in: { text: "message" },
            out: ["out"],
          },

          step2: {
            run: {
              class: "CommandLineTool",
              baseCommand: "cat",
              inputs: {
                file: {
                  type: "File",
                  inputBinding: { position: 1 },
                },
              },
              outputs: {
                out: {
                  type: "File",
                  outputBinding: {
                    glob: "s2.txt",
                  },
                },
              },
            },
            in: { file: "step1/out" },
            out: ["out"],
          },
          step3: {
            run: {
              class: "CommandLineTool",
              baseCommand: "cat",
              inputs: {
                file: {
                  type: "File",
                  inputBinding: { position: 1 },
                },
              },
              outputs: {
                out: {
                  type: "File",
                  outputBinding: {
                    glob: "s3.txt",
                  },
                },
              },
            },
            in: { file: "step2/out" },
            out: ["out"],
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
outputs:
  final:
    type: File
    outputSource: step3/out
steps:
  step1:
    run:
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
            glob: s1.txt
    in:
      text: message
    out: [out]
  step2:
    run:
      class: CommandLineTool
      baseCommand: cat
      inputs:
        file:
          type: File
          inputBinding:
            position: 1
      outputs:
        out:
          type: File
          outputBinding:
            glob: s2.txt
    in:
      file: step1/out
    out:
      - out
  step3:
    run:
      class: CommandLineTool
      baseCommand: cat
      inputs:
        file:
          type: File
          inputBinding:
            position: 1
      outputs:
        out:
          type: File
          outputBinding:
            glob: s3.txt
    in:
      file: step2/out
    out: [out]`,
    },
  ],
  parameters: [],
};

export const source4 = { object, string };
