import { Node as xyFlowNode } from "@xyflow/react";

import { CWLObject } from "@theseus-cwl/types";

import { ColorState } from "../../hooks";
import { getMaxRight, getWrapperNode } from "../general";
import { initializeInputNodes } from "./initialize-input-nodes";
import { initializeOutputNodes } from "./initialize-output-nodes";
import { initializeStepNodes } from "./initialize-step-nodes";

/**
 * The config for {@link initializeNodes}.
 */
export type InitializeNodesConfig = {
  cwlObject: CWLObject;
  wrappers: boolean;
  colors: ColorState;
  readOnly: boolean;
};

/**
 * Initializes the nodes. Receives CWL object information
 * and returns the corresponding array of {@link xyFlowNode} representing the visual map.
 */
export const initializeNodes = (props: InitializeNodesConfig): xyFlowNode[] => {
  const { cwlObject, wrappers, colors, readOnly } = props;

  const commonProps = { wrappers, readOnly };

  /** Steps will be initialized first because they determine the position of the other nodes */
  const stepNodes = initializeStepNodes({
    nodesInfo: cwlObject.steps,
    color: colors.steps,
    ...commonProps,
  });

  const inputNodes = initializeInputNodes({
    nodesInfo: cwlObject.inputs,
    color: colors.input,
    stepNodes,
    ...commonProps,
  });

  const outputNodes = initializeOutputNodes({
    nodesInfo: cwlObject.outputs,
    color: colors.output,
    stepNodes,
    ...commonProps,
  });

  const nodes = [...inputNodes, ...stepNodes, ...outputNodes];

  if (wrappers) {
    const maxRight = getMaxRight(nodes);
    const wrapperNodes: xyFlowNode[] = [
      getWrapperNode(inputNodes, maxRight),
      getWrapperNode(stepNodes, maxRight),
      getWrapperNode(outputNodes, maxRight),
    ];
    nodes.push(...wrapperNodes);
  }

  return nodes;
};
