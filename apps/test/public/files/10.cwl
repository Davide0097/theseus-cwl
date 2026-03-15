cwlVersion: v1.2
$graph:
  main:
    id: main
    class: Workflow
    inputs:
      start: string
    outputs:
      final:
        type: string
        outputSource: stepC/outC
    steps:
      stepA:
        run: subA
        in: { inp: start }
        out: [outA]

      stepB:
        run: subB
        in: { inp: stepA/outA }
        out: [outB]

      stepC:
        run: subC
        in:
          in1: stepA/outA
          in2: stepB/outB
        out: [outC]

  subA:
    id: subA
    class: Workflow
    inputs:
      inp: string
    outputs:
      outA:
        type: string
        outputSource: passthrough/out
    steps:
      passthrough:
        run: identity
        in: { x: inp }
        out: [out]

  subB:
    id: subB
    class: Workflow
    inputs:
      inp: string
    outputs:
      outB:
        type: string
        outputSource: passthrough/out
    steps:
      passthrough:
        run: identity
        in: { x: inp }
        out: [out]

  subC:
    id: subC
    class: Workflow
    inputs:
      in1: string
      in2: string
    outputs:
      outC:
        type: string
        outputSource: merge/out
    steps:
      merge:
        run: joiner
        in:
          x1: in1
          x2: in2
        out: [out]

  identity:
    id: identity
    class: Workflow
    inputs:
      x: string
    outputs:
      out: string
    steps: {}

  joiner:
    id: joiner
    class: Workflow
    inputs:
      x1: string
      x2: string
    outputs:
      out:
        type: string
        outputSource: x1
    steps: {}
