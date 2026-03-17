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
            out: ["sum"],
          },
          multiply: {
            run: "../math/multiply.cwl",
            in: {
              number: { source: "add/sum" },
              multiplier: { source: "multiplier" },
            },
            out: ["result"],
          },
        },
        outputs: {
          final_result: {
            type: "int",
            outputSource: "multiply/result",
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
  num1:
    type: int
  num2:
    type: int
  multiplier:
    type: int
steps:
  add:
    run: ../math/add.cwl
    in:
      a:
        source: num1
      b:
        source: num2
    out: [sum]
  multiply:
    run: ../math/multiply.cwl
    in:
      number:
        source: add/sum
      multiplier:
        source: multiplier
    out: [result]
outputs:
  final_result:
    type: int
    outputSource: multiply/result`,
    },
  ],
  parameters: [],
};

export const source5 = { object, string };
