import { Edge } from "@xyflow/react";

import { Workflow } from "@theseus-cwl/types";

import { getEdge, getSourceKeys } from "../general";

export const initializeStepToStepEdges = (
  cwlFile: Workflow,
  labels: boolean,
): Edge[] => {
  const edges: Edge[] = [];

  Object.entries(cwlFile.steps).forEach(([stepKey, step]) => {
    Object.values(step.in).forEach((stepIn) => {
      if (!stepIn) {
        return;
      }

      getSourceKeys(stepIn.source).forEach((sourceKey) => {
        if (cwlFile.steps[sourceKey]) {
          edges.push(
            getEdge({
              source: {
                workflowId: cwlFile.id,
                key: sourceKey,
              },
              target: {
                workflowId: cwlFile.id,
                key: stepKey,
              },
              type: "step_to_step",
              hasLabel: labels,
            }),
          );
        }
      });
    });
  });

  return edges;
};
