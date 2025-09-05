import { Edge } from "@xyflow/react";

import { CWLObject } from "@theseus-cwl/types";

import { getEdge } from "../general";

export const initializeStepToOutputEdges = (
  cwlObject: CWLObject,
  labels: boolean
): Edge[] => {
  const edges: Edge[] = [];

  Object.entries(cwlObject.outputs).forEach(([outputKey, output]) => {
    const source = output.outputSource?.split("/")[0];

    Object.keys(cwlObject.steps).forEach((stepKey) => {
      if (stepKey === source) {
        edges.push(getEdge(stepKey, outputKey, "step_to_output", labels));
      }
    });
  });

  return edges;
};
