import { Edge } from "@xyflow/react";

import { CWLObject } from "@theseus-cwl/types";

import { initializeInputToStepEdges } from "./initialize-input-step-edges";
import { initializeStepToOutputEdges } from "./initialize-step-to-output-edges";
import { initializeStepToStepEdges } from "./initialize-step-to-step-edges";

/**
 * Initialize all the edges from the CWLWorkflow object
 *
 * @param {CWLWorkflow} cwlWorkflow
 *
 * @returns {Edge[]}
 */
export const initializeEdges = (
  cwlObject: CWLObject,
  labels: boolean
): Edge[] => {
  const inputToStepEdges = initializeInputToStepEdges(cwlObject, labels);
  const stepToStepEdges = initializeStepToStepEdges(cwlObject, labels);
  const stepToOutputEdges = initializeStepToOutputEdges(cwlObject, labels);

  return [...inputToStepEdges, ...stepToStepEdges, ...stepToOutputEdges];
};
