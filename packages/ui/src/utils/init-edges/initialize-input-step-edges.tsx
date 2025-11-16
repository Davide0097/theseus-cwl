import { Edge } from "@xyflow/react";

import { Workflow } from "@theseus-cwl/types";

import { getEdge } from "../general";

export const initializeInputToStepEdges = (
  cwlObject: Workflow,
  labels: boolean,
  id?: string,

): Edge[] => {
  const edges: Edge[] = [];
  const inputKeys = Object.keys(cwlObject.inputs);

  Object.entries(cwlObject.steps || {}).forEach(([stepKey, step]) => {
    Object.values(step.in).forEach((stepIn) => {
      if (!stepIn) {
        return;
      }

      if (typeof stepIn === "string") {
        if (inputKeys.includes(stepIn)) {
          edges.push(getEdge(stepIn, stepKey, "input_to_step", labels,id));
        }
      } else {
        const sources: (undefined|string)[] = Array.isArray(stepIn.source)
          ? stepIn.source
          : [stepIn.source];

        sources.forEach((src) => {
          if (src && inputKeys.includes(src)) {
            edges.push(getEdge(src, stepKey, "input_to_step", labels,id));
          }
        });
      }
    });
  });

  return edges;
};
