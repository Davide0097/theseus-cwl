import { Process, Workflow } from "@theseus-cwl/types";
import { Edge } from "@xyflow/react";

import { getEdge, isRunReferenceTo } from "../general";

export const initializeMainStepToSubworkflowInputEdges = (
  mainWorkflow: Workflow,
  allWorkflows: Record<string, Workflow | Process>,
  labels: boolean,
): Edge[] => {
  const edges: Edge[] = [];

  Object.entries(mainWorkflow.steps).forEach(([stepKey, step]) => {
    if (typeof step.run !== "string") {
      return;
    }

    const subWorkflow = Object.values(allWorkflows).find((process) =>
      isRunReferenceTo(step.run, process.id),
    );

    if (!subWorkflow) {
      console.warn(
        `Step "${stepKey}" in workflow "${mainWorkflow.id}" references a missing or invalid subworkflow: "${step.run}"`,
      );
      return;
    }

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
