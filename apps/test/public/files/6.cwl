cwlVersion: v1.2
class: Workflow

inputs:
  input1: string
  input2: string
  input3: string

outputs:
  final_out1:
    type: string
    outputSource: stepF/outF1
  final_out2:
    type: string
    outputSource: stepF/outF2
  intermediate_out:
    type: string
    outputSource: stepD/outD

steps:
  stepA:
    run: workflowA.cwl
    in:
      inpA1: input1
      inpA2: input2
    out: [outA1, outA2]

  stepB:
    run: workflowB.cwl
    in:
      inpB: stepA/outA1
    out: [outB]

  stepC:
    run: workflowC.cwl
    in:
      inpC1: stepA/outA2
      inpC2: input3
    out: [outC1, outC2]

  stepD:
    run: workflowD.cwl
    in:
      inpD: stepB/outB
    out: [outD]

  stepE:
    run: workflowE.cwl
    in:
      inpE1: stepC/outC1
      inpE2: stepC/outC2
    out: [outE]

  stepF:
    run: workflowF.cwl
    in:
      left: stepD/outD
      right: stepE/outE
    out: [outF1, outF2]
