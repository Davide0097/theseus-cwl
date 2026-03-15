import { Edge } from "@xyflow/react";

import { Workflow } from "@theseus-cwl/types";

import { getEdge } from "../general";

export const initializeStepToOutputEdges = (
  cwlFile: Workflow,
  labels: boolean,
): Edge[] => {
  const edges: Edge[] = [];

  Object.entries(cwlFile.outputs).forEach(([outputKey, output]) => {
    const source = output.outputSource?.split("/")[0];

    Object.keys(cwlFile.steps || {}).forEach((stepKey) => {
      if (stepKey === source) {
        edges.push(
          getEdge({
            source: {
              workflowId: cwlFile.id,
              key: stepKey,
            },
            target: {
              workflowId: cwlFile.id,
              key: outputKey,
            },
            type: "step_to_output",
            hasLabel: labels,
          }),
        );
      }
    });
  });

  return edges;
};
