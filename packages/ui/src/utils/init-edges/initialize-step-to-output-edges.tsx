import { Edge, MarkerType } from "@xyflow/react";

import { CWLObject, CWLWorkflow } from "../../ui";

export const initializeEdgesStepToOutputEdges = (
  cwlObject: CWLObject
): Edge[] => {
  const edges: Edge[] = [];

  Object.entries(cwlObject!.outputs).forEach(([key, output]) => {
    const source = output.outputSource.split("/")[0];

    cwlObject?.steps.forEach((step) => {
      if (step.id === source) {
        edges.push({
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#4c8bf5",
          },
          id: `edge-${"sourceStepId"}-to-${source}`,
          source: step.id,
          target: key,
          animated: true,
        });
      }
    });
  });

  return edges;
};
