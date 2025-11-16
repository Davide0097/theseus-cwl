import { Edge } from "@xyflow/react";

import { Workflow } from "@theseus-cwl/types";

import { getEdge } from "../general";

export const initializeStepToStepEdges = (
  cwlObject: Workflow,
  labels: boolean,
  id?: string,
): Edge[] => {
  const edges: Edge[] = [];

  Object.entries(cwlObject.steps|| {}).forEach(([stepKey, step]) => {
    Object.values(step.in).forEach((stepIn) => {
      if (!stepIn) {
        return;
      }

      if (typeof stepIn === "string") {
        const sourcePrefix = stepIn?.split("/")[0];
        if (sourcePrefix) {
          edges.push(getEdge(sourcePrefix, stepKey, "step_to_step", labels,id));
        }
      } else {
        const sources: (undefined |string)[] = Array.isArray(stepIn.source)
          ? stepIn.source
          : [stepIn.source];

        sources.forEach((src) => {
          const sourcePrefix = src?.split("/")[0];

          if (sourcePrefix) {
            edges.push(getEdge(sourcePrefix, stepKey, "step_to_step", labels,id));
          }
        });
      }
    });
  });

  return edges;
};
