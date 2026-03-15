cwlVersion: v1.2
class: Workflow

inputs:
  input1: string

outputs:
  final_out:
    type: string
    outputSource: stepC/outputC

steps:
  stepA:
    run: workflowA.cwl
    in:
      inpA: input1
    out: [outA]

  stepB:
    run: workflowB.cwl
    in:
      inpB: stepA/outA
    out: [outB]

  stepC:
    run: workflowC.cwl
    in:
      inpC: stepB/outB
    out: [outputC]
