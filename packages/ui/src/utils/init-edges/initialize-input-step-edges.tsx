import { Edge, MarkerType } from "@xyflow/react";
import { CWLObject, CWLWorkflow } from "../../ui";

export const initializeInputToStepEdges = (
    cwlObject: CWLObject
): Edge[] => {
  const edges: Edge[] = [];

  cwlObject!.steps.forEach((step) => {
    const stepId = step.id;
    const stepInputs = step.content.in;
    const ids = Object.keys(cwlObject?.inputs);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(stepInputs).forEach(([_key, _value]) => {
      if (ids?.includes(_value.source)) {
        edges.push({
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "red",
          },
          id: `edge-${_value.source}-to-${stepId}`,
          source: _value.source,
          target: stepId,
          animated: true,
        });
      }
    });
  });

  return edges;
};
