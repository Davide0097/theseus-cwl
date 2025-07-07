import { Node as xyFlowNode } from "@xyflow/react";

import { CWLObject, CWLWorkflow } from "../../ui";
import { initializeInputNodes } from "./initialize-input-nodes";
import { initializeOutputNodes } from "./initialize-output-nodes";
import { initializeStepNodes } from "./initialize-step-nodes";

/**
 * Initialize all the nodes from the CWLWorkflow component
 *
 * @param {CWLWorkflow} cwlWorkflow
 *
 * @returns {xyFlowNode[]}
 */
export const initializeNodes = (
  cwlObject: CWLObject| undefined,
  addInput: (() => void) | undefined,
  addStep: (() => any) | undefined,
  addOutput: (() => void) | undefined,
  colors?: Record<string, string>,
  wrappers?: boolean
): xyFlowNode[] => {
  const inputNodes = initializeInputNodes(
    cwlObject,
    addInput,
    colors,
    wrappers
  );
  const stepNodes = initializeStepNodes(
    cwlObject,
    addStep,
    colors,
    inputNodes,
    wrappers
  );
  const outputNodes = initializeOutputNodes(
    cwlObject,
    addOutput,
    colors,
    inputNodes,
    wrappers
  );

  return [...inputNodes, ...stepNodes, ...outputNodes];
};
