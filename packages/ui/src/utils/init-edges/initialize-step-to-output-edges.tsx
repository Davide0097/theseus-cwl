import { Edge } from "@xyflow/react";

import { Workflow } from "@theseus-cwl/types";

import { getEdge } from "../general";

export const initializeStepToOutputEdges = (
  cwlObject: Workflow,
  labels: boolean,
  id?: string,

): Edge[] => {
  const edges: Edge[] = [];

  Object.entries(cwlObject.outputs).forEach(([outputKey, output]) => {
    const source = output.outputSource?.split("/")[0];

    Object.keys(cwlObject.steps|| {}).forEach((stepKey) => {
      if (stepKey === source) {
        edges.push(getEdge(stepKey, outputKey, "step_to_output", labels,id));
      }
    });
  });

  return edges;
};
