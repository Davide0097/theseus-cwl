import { Edge, MarkerType } from "@xyflow/react";

import { CWLObject } from "@theseus-cwl/types";

export const initializeEdgesStepToStepEdges = (
  cwlObject: CWLObject
): Edge[] => {
  const edges: Edge[] = [];

  cwlObject!.steps.forEach((step) => {
    const stepId = step.id;
    const stepInputs = step.content.in;

    Object.entries(stepInputs).forEach(([, inputValue]) => {
      if (inputValue.source) {
        const sourceStepId = inputValue.source.split("/")[0];

        edges.push({
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#4c8bf5",
          },
          id: `edge-${sourceStepId}-to-${stepId}`,
          source: sourceStepId || '',
          target: stepId,
          animated: true,
        });
      }
    });
  });

  return edges;
};
