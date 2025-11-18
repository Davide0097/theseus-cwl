cwlVersion: v1.2
class: Workflow

inputs:
  input: string

steps:
  step:
    run: workflow.cwl
    in:
      inp: input
    out: [out]

outputs:
  final_out:
    type: string
    outputSource: step/out