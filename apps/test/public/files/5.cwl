cwlVersion: v1.2
class: Workflow

inputs:
  input1: string

outputs:
  final_out:
    type: string
    outputSource: stepF/outF

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
      inpC: stepA/outA
    out: [outC]

  stepD:
    run: workflowD.cwl
    in:
      inpD: stepB/outB
    out: [outD]

  stepE:
    run: workflowE.cwl
    in:
      inpE: stepC/outC
    out: [outE]

  stepF:
    run: workflowF.cwl
    in:
      left: stepD/outD
      right: stepE/outE
    out: [outF]
