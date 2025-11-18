import { Edge } from "@xyflow/react";

import { Workflow } from "@theseus-cwl/types";

import { getEdge } from "../general";

export const initializeStepToStepEdges = (
  cwlFile: Workflow,
  labels: boolean,
): Edge[] => {
  const edges: Edge[] = [];

  Object.entries(cwlFile.steps || {}).forEach(([stepKey, step]) => {
    Object.values(step.in).forEach((stepIn) => {
      if (!stepIn) {
        return;
      }

      const sources: (undefined | string)[] = Array.isArray(stepIn.source)
        ? stepIn.source
        : [stepIn.source];

      sources.forEach((src) => {
        const sourcePrefix = src?.split("/")[0];

        if (sourcePrefix) {
          edges.push(
            getEdge({
              source: {
                workflowId: cwlFile.id,
                key: sourcePrefix,
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
