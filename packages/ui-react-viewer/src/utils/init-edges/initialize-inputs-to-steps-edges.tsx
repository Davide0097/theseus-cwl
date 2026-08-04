import { Edge } from "@xyflow/react";

import { Process, Workflow } from "@theseus-cwl/types";

import { getEdge, getSourceKeys } from "../general";

export const initializeInputToStepEdges = (
  cwlFile: Workflow,
  labels: boolean,
): Edge[] => {
  const edges: Edge[] = [];
  const inputKeys = Object.keys(cwlFile.inputs || {});

  Object.entries(cwlFile.steps).forEach(([stepKey, step]) => {
    Object.values(step.in).forEach((stepIn) => {
      if (!stepIn) {
        return;
      }

      getSourceKeys(stepIn.source).forEach((sourceKey) => {
        if (inputKeys.includes(sourceKey)) {
          edges.push(
            getEdge({
              source: {
                workflowId: cwlFile.id,
                key: sourceKey,
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
    });
  });

  return edges;
};

export const initializeProcessInputToOutputEdges = (
  cwlFile: Workflow | Process,
  labels: boolean,
): Edge[] => {
  const edges: Edge[] = [];

  Object.keys(cwlFile.outputs || {}).forEach((outputKey) => {
    Object.keys(cwlFile.inputs || {}).forEach((inputKey) => {
      edges.push(
        getEdge({
          source: {
            workflowId: cwlFile.id,
            key: inputKey,
          },
          target: {
            workflowId: cwlFile.id,
            key: outputKey,
          },
          type: "input_to_output",
          hasLabel: labels,
        }),
      );
    });
  });

  return edges;
};
