import { Edge } from "@xyflow/react";

import { CWLObject } from "@theseus-cwl/types";

import { getEdge } from "../general";

export const initializeStepToStepEdges = (
  cwlObject: CWLObject,
  labels: boolean
): Edge[] => {
  const edges: Edge[] = [];

  Object.entries(cwlObject.steps).forEach(([stepKey, step]) => {
    Object.values(step.in).forEach((stepIn) => {
      if (!stepIn) {
        return;
      }

      if (typeof stepIn === "string") {
        const sourcePrefix = stepIn?.split("/")[0];
        if (sourcePrefix) {
          edges.push(getEdge(sourcePrefix, stepKey, "step_to_step", labels));
        }
      } else {
        const sources: string[] = Array.isArray(stepIn.source)
          ? stepIn.source
          : [stepIn.source];

        sources.forEach((src) => {
          const sourcePrefix = src?.split("/")[0];

          if (sourcePrefix) {
            edges.push(getEdge(sourcePrefix, stepKey, "step_to_step", labels));
          }
        });
      }
    });
  });

  return edges;
};
