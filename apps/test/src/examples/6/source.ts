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
          input_a: { type: "string" },
          input_b: { type: "string" },
          input_c: { type: "string" },
        },
        steps: {
          step1: {
            run: "tools/step1.cwl",
            in: {
              param_a: { source: "input_a" },
            },
            out: ["out1"],
          },
          step2: {
            run: "tools/step2.cwl",
            in: {
              param_b: { source: "input_b" },
              dependency: { source: "step1/out1" },
            },
            out: ["out2"],
          },
          step3: {
            run: "tools/step3.cwl",
            in: {
              param_c: { source: "input_c" },
              dependency: { source: "step2/out2" },
            },
            out: ["out3"],
          },
          final: {
            run: "tools/finalize.cwl",
            in: {
              input: { source: "step3/out3" },
            },
            out: ["final_output"],
          },
        },
        outputs: {
          result: {
            type: "File",
            outputSource: "final/final_output",
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
  input_a:
    type: string
  input_b:
    type: string
  input_c:
    type: string
steps:
  step1:
    run: tools/step1.cwl
    in:
      param_a:
        source: input_a
    out:
      - out1
  step2:
    run: tools/step2.cwl
    in:
      param_b:
        source: input_b
      dependency:
        source: step1/out1
    out:
      - out2
  step3:
    run: tools/step3.cwl
    in:
      param_c:
        source: input_c
      dependency:
        source: step2/out2
    out:
      - out3
  final:
    run: tools/finalize.cwl
    in:
      input:
        source: step3/out3
    out:
      - final_output
outputs:
  result:
    type: File
    outputSource: final/final_output`,
    },
  ],
  parameters: [],
};

export const source6 = { object, string };
