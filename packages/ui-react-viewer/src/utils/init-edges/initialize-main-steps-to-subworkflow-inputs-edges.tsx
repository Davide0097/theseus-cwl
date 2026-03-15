import { Workflow } from "@theseus-cwl/types";
import { Edge } from "@xyflow/react";

import { getEdge } from "../general";

export const initializeMainStepToSubworkflowInputEdges = (
  mainWorkflow: Workflow,
  allWorkflows: Record<string, Workflow>,
  labels: boolean,
): Edge[] => {
  const edges: Edge[] = [];

  Object.entries(mainWorkflow.steps || {}).forEach(([stepKey, step]) => {
    const subWorkflowId = typeof step.run === "string" ? step.run : undefined;

    if (!subWorkflowId || !allWorkflows[subWorkflowId]) {
      console.warn(
        `Step "${stepKey}" in workflow "${mainWorkflow.id}" references a missing or invalid subworkflow: "${step.run}"`,
      );
      return;
    }

    const subWorkflow = allWorkflows[subWorkflowId];

    const subworkflowInputId = Object.values(subWorkflow.inputs || {})[0]?.id;

    if (!subworkflowInputId) {
      console.warn(
        `Subworkflow "${subWorkflow.id}" referenced by step "${stepKey}" in workflow "${mainWorkflow.id}" has no inputs defined.`,
      );
      return;
    }

    edges.push(
      getEdge({
        source: {
          workflowId: mainWorkflow.id,
          key: stepKey,
        },
        target: {
          workflowId: subWorkflow.id,
          key: subworkflowInputId,
        },
        type: "workflow_to_workflow",
        hasLabel: labels,
      }),
    );
  });

  return edges;
};
