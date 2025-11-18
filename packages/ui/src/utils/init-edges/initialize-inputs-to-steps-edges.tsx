import { Edge } from "@xyflow/react";

import { Workflow } from "@theseus-cwl/types";

import { getEdge } from "../general";

export const initializeInputToStepEdges = (
  cwlFile: Workflow,
  labels: boolean,
): Edge[] => {
  const edges: Edge[] = [];
  const inputKeys = Object.keys(cwlFile.inputs || {});

  Object.entries(cwlFile.steps || {}).forEach(([stepKey, step]) => {
    Object.values(step.in).forEach((stepIn) => {
      if (!stepIn) {
        return;
      } else {
        const sources: (undefined | string)[] = Array.isArray(stepIn.source)
          ? stepIn.source
          : [stepIn.source];

        sources.forEach((src) => {
          if (src && inputKeys.includes(src)) {
            edges.push(
              getEdge({
                source: {
                  workflowId: cwlFile.id,
                  key: src,
                },
                target: {
                  workflowId: cwlFile.id,
                  key: stepKey,
                },
                type: "input_to_step",
                hasLabel: labels,
              }),
            );
          }
        });
      }
    });
  });

  return edges;
};
