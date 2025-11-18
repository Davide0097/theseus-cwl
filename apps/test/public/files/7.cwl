cwlVersion: v1.2
class: Workflow

inputs:
  input1: string
  input2: string
  input3: string
  input4: string

outputs:
  final_out1:
    type: string
    outputSource: stepG/outG1
  final_out2:
    type: string
    outputSource: stepG/outG2
  side_out:
    type: string
    outputSource: stepF/outF
  intermediate_out1:
    type: string
    outputSource: stepD/outD
  intermediate_out2:
    type: string
    outputSource: stepE/outE

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
      inpB1: stepA/outA1
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
      extra: input4
    out: [outF]

  stepG:
    run: workflowG.cwl
    in:
      in1: stepF/outF
      in2: stepC/outC1
    out: [outG1, outG2]
