import { Edge } from "@xyflow/react";

import { CWLObject } from "@theseus-cwl/types";

import { initializeInputToStepEdges } from "./initialize-input-step-edges";
import { initializeEdgesStepToOutputEdges } from "./initialize-step-to-output-edges";
import { initializeEdgesStepToStepEdges } from "./initialize-step-to-step-edges";

/**
 * Initialize all the edges from the CWLWorkflow component
 *
 * @param {CWLWorkflow} cwlWorkflow
 *
 * @returns {xyFlowNode[]}
 */
export const initializeEdges = (cwlObject: CWLObject): Edge[] => {
  const inputToStepEdges = initializeInputToStepEdges(cwlObject);
  const stepToStepEdges = initializeEdgesStepToStepEdges(cwlObject);
  const stepToOutputEdges = initializeEdgesStepToOutputEdges(cwlObject);

  return [...inputToStepEdges, ...stepToStepEdges, ...stepToOutputEdges];
};
