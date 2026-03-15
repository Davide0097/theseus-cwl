cwlVersion: v1.2
class: Workflow

inputs:
  input1: string
  input2: string
  input3: string
  input4: string
  input5: string
  input6: string

outputs:
  final_out1:
    type: string
    outputSource: stepJ/outJ1
  final_out2:
    type: string
    outputSource: stepJ/outJ2
  intermediate_out1:
    type: string
    outputSource: stepD/outD
  intermediate_out2:
    type: string
    outputSource: stepE/outE2
  intermediate_out3:
    type: string
    outputSource: stepG/outG
  side_out:
    type: string
    outputSource: stepF/outF

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
      inpD1: stepB/outB
      inpD2: stepC/outC1
    out: [outD]

  stepE:
    run: workflowE.cwl
    in:
      inpE1: stepC/outC2
      inpE2: input4
    out: [outE1, outE2]

  stepF:
    run: workflowF.cwl
    in:
      left: stepD/outD
      right: stepE/outE1
      extra: input5
    out: [outF]

  stepG:
    run: workflowG.cwl
    in:
      in1: stepE/outE2
      in2: stepF/outF
      in3: input6
    out: [outG]

  stepH:
    run: workflowH.cwl
    in:
      left: stepD/outD
      right: stepG/outG
    out: [outH]

  stepI:
    run: workflowI.cwl
    in:
      in1: stepH/outH
      in2: stepF/outF
      in3: stepB/outB
    out: [outI]

  stepJ:
    run: workflowJ.cwl
    in:
      left: stepI/outI
      right: stepG/outG
    out: [outJ1, outJ2]
