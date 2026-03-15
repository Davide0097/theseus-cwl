import { Edge } from "@xyflow/react";

import { CWLPackedDocument, Workflow } from "@theseus-cwl/types";

import { getMainWorkflow, isPackedDocument } from "../general";
import { initializeInputToStepEdges } from "./initialize-inputs-to-steps-edges";
import { initializeMainStepToSubworkflowInputEdges } from "./initialize-main-steps-to-subworkflow-inputs-edges";
import { initializeStepToOutputEdges } from "./initialize-steps-to-outputs-edges";
import { initializeStepToStepEdges } from "./initialize-steps-to-steps-edges";

export const intializeSingleWorkflowEdges = (
  cwlFile: Workflow,
  labels: boolean,
) => {
  const inputToStepEdges = initializeInputToStepEdges(cwlFile, labels);
  const stepToStepEdges = initializeStepToStepEdges(cwlFile, labels);
  const stepToOutputEdges = initializeStepToOutputEdges(cwlFile, labels);
  return [...inputToStepEdges, ...stepToStepEdges, ...stepToOutputEdges];
};

/**
 * Initialize all the edges from the CWLFile object
 *
 * @param {Workflow | CWLPackedDocument} cwlFile
 *
 * @returns {Edge[]}
 */
export const initializeEdges = (
  cwlFile: Workflow | CWLPackedDocument,
  labels: boolean,
): Edge[] => {
  if (!isPackedDocument(cwlFile)) {
    return intializeSingleWorkflowEdges(cwlFile, labels);
  } else {
    const allEdges: Edge[] = [];

    const mainWorkflow =
      getMainWorkflow(cwlFile) || Object.values(cwlFile.$graph)[0];

    if (!mainWorkflow) {
      console.warn(
        "CWLViewer: Could not find a main workflow in the packed document. " +
          "Ensure that the CWL file has a valid entrypoint or main workflow defined.",
      );
      return [];
    }

    Object.values(cwlFile.$graph).map((workflow) => {
      const inputToStepEdges = initializeInputToStepEdges(workflow, labels);
      const stepToStepEdges = initializeStepToStepEdges(workflow, labels);
      const stepToOutputEdges = initializeStepToOutputEdges(workflow, labels);
      allEdges.push(
        ...inputToStepEdges,
        ...stepToStepEdges,
        ...stepToOutputEdges,
      );
    });

    const mainStepsToSubWorkflowInputEdges =
      initializeMainStepToSubworkflowInputEdges(
        mainWorkflow,
        cwlFile.$graph,
        labels,
      );

    allEdges.push(...mainStepsToSubWorkflowInputEdges);

    return allEdges;
  }
};
