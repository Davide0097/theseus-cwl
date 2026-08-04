import { Edge } from "@xyflow/react";

import { Workflow } from "@theseus-cwl/types";

import { getEdge, getSourceKeys } from "../general";

export const initializeStepToOutputEdges = (
  cwlFile: Workflow,
  labels: boolean,
): Edge[] => {
  const edges: Edge[] = [];

  Object.entries(cwlFile.outputs).forEach(([outputKey, output]) => {
    // An outputSource can reference several steps (MultipleInputFeatureRequirement,
    // e.g. with linkMerge/pickValue) — draw one edge per referenced step.
    getSourceKeys(output.outputSource)
      .filter((sourceKey) => cwlFile.steps[sourceKey])
      .forEach((stepKey) => {
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
      });
  });

  return edges;
};
