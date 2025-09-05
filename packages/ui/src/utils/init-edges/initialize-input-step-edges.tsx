import { Edge } from "@xyflow/react";

import { CWLObject } from "@theseus-cwl/types";

import { getEdge } from "../general";

export const initializeInputToStepEdges = (
  cwlObject: CWLObject,
  labels: boolean
): Edge[] => {
  const edges: Edge[] = [];
  const inputKeys = Object.keys(cwlObject.inputs);

  Object.entries(cwlObject.steps).forEach(([stepKey, step]) => {
    Object.values(step.in).forEach((stepIn) => {
      if (!stepIn) {
        return;
      }

      if (typeof stepIn === "string") {
        if (inputKeys.includes(stepIn)) {
          edges.push(getEdge(stepIn, stepKey, "input_to_step", labels));
        }
      } else {
        const sources: string[] = Array.isArray(stepIn.source)
          ? stepIn.source
          : [stepIn.source];

        sources.forEach((src) => {
          if (inputKeys.includes(src)) {
            edges.push(getEdge(src, stepKey, "input_to_step", labels));
          }
        });
      }
    });
  });

  return edges;
};
