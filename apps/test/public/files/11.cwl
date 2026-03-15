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
        outputSource: stepG/outG
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
        in: { inp: stepA/outA }
        out: [outC]

      stepD:
        run: subD
        in:
          in1: stepB/outB
          in2: stepC/outC
        out: [outD]

      stepE:
        run: subE
        in: { inp: stepC/outC }
        out: [outE]

      stepF:
        run: subF
        in:
          in1: stepD/outD
          in2: stepE/outE
        out: [outF]

      stepG:
        run: subG
        in: { inp: stepF/outF }
        out: [outG]

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
        outputSource: step/out
    steps:
      step:
        run: identity
        in: { x: inp }
        out: [out]

  subC:
    class: Workflow
    id: subC
    inputs:
      inp: string
    outputs:
      outC:
        type: string
        outputSource: passthrough/out
    steps:
      passthrough:
        run: identity
        in: { x: inp }
        out: [out]

  subD:
    id: subD
    class: Workflow
    inputs:
      in1: string
      in2: string
    outputs:
      outD:
        type: string
        outputSource: merge/out
    steps:
      merge:
        run: joiner
        in:
          x1: in1
          x2: in2
        out: [out]

  subE:
    id: subE
    class: Workflow
    inputs:
      inp: string
    outputs:
      outE:
        type: string
        outputSource: step/out
    steps:
      step:
        run: identity
        in: { x: inp }
        out: [out]

  subF:
    id: subF
    class: Workflow
    inputs:
      in1: string
      in2: string
    outputs:
      outF:
        type: string
        outputSource: step/out
    steps:
      step:
        run: joiner
        in:
          x1: in1
          x2: in2
        out: [out]

  subG:
    id: subG
    class: Workflow
    inputs:
      inp: string
    outputs:
      outG:
        type: string
        outputSource: step/out
    steps:
      step:
        run: identity
        in: { x: inp }
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
