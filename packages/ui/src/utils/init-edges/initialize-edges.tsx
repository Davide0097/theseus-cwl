import { Edge } from "@xyflow/react";

import { CWLPackedDocument, Workflow } from "@theseus-cwl/types";

import { initializeInputToStepEdges } from "./initialize-input-step-edges";
import { initializeStepToOutputEdges } from "./initialize-step-to-output-edges";
import { initializeStepToStepEdges } from "./initialize-step-to-step-edges";
 
import { getEdge } from "../general";
import { isPackedWorkflow } from "../general/is-packed-worflow";

export const intializeSingleWorkflowEdges = (
  cwlObject: Workflow,
  labels: boolean
) => {
  const inputToStepEdges = initializeInputToStepEdges(
    cwlObject as Workflow,
    labels
  );
  const stepToStepEdges = initializeStepToStepEdges(
    cwlObject as Workflow,
    labels
  );
  const stepToOutputEdges = initializeStepToOutputEdges(
    cwlObject as Workflow,
    labels
  );
  return [...inputToStepEdges, ...stepToStepEdges, ...stepToOutputEdges];
};

/**
 * Initialize all the edges from the CWLWorkflow object
 *
 * @param {CWLWorkflow} cwlWorkflow
 *
 * @returns {Edge[]}
 */
export const initializeEdges = (
  cwlObject: Workflow | CWLPackedDocument,
  labels: boolean
): Edge[] => {
  if (!isPackedWorkflow(cwlObject)) {
    return intializeSingleWorkflowEdges(cwlObject, labels);
  } else {
    const allEdges: Edge[] = [];

    Object.entries(cwlObject.$graph).map(([id, workflow]) => {
      const inputToStepEdges = initializeInputToStepEdges(workflow, labels, id);
      const stepToStepEdges = initializeStepToStepEdges(workflow, labels, id);
      const stepToOutputEdges = initializeStepToOutputEdges(
        workflow,
        labels,
        id
      );
      allEdges.push(
        ...inputToStepEdges,
        ...stepToStepEdges,
        ...stepToOutputEdges
      );
    });

    const mainWorkflow = cwlObject?.$graph?.find(
      (wf) => wf.id === "#main" || wf.class === "Workflow"
    ) as Workflow;

    const allWorkflowsMap: Record<string, Workflow> = {};
    cwlObject.$graph.forEach((wf) => (allWorkflowsMap[wf.id] = wf));

    const mainToSubEdges = initializeMainToSubworkflowInputEdges(
      mainWorkflow,
      allWorkflowsMap,
      labels
    );

    allEdges.push(...mainToSubEdges);

    return allEdges;
  }
};

/**
 * Creates edges between the MAIN workflow steps → SUBWORKFLOW inputs.
 *
 */

/**
 * Creates edges from MAIN workflow steps → SUBWORKFLOW inputs.
 */
export const initializeMainToSubworkflowInputEdges = (
  mainWorkflow: Workflow,
  allWorkflows: Record<string, Workflow>,
  labels: boolean
): Edge[] => {
  const edges: Edge[] = [];

  Object.entries(mainWorkflow.steps || {}).forEach(([stepKey, step]) => {
    const subWorkflowId = typeof step.run === "string" ? step.run : undefined;

    if (!subWorkflowId || !allWorkflows[subWorkflowId]) return; // not a subworkflow

    const subWorkflow = allWorkflows[subWorkflowId];

    edges.push(
      getEdge(
        stepKey,
        Object.keys(subWorkflow.inputs)[0]!,
        "worflow_to_worflow",
        labels,
        mainWorkflow.id
      )
    );
  });

  return edges;
};
