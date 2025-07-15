import { Node as xyFlowNode } from "@xyflow/react";

import { CWLObject } from "@theseus-cwl/types";

import { initializeInputNodes } from "./initialize-input-nodes";
import { initializeOutputNodes } from "./initialize-output-nodes";
import { initializeStepNodes } from "./initialize-step-nodes";

export type InitializeNodesProps = {
  cwlObject: CWLObject;
  readonly: boolean;
  wrappers: boolean;
};

export const initializeNodes = (props: InitializeNodesProps): xyFlowNode[] => {
  const { cwlObject, readonly, wrappers } = props;

  const inputNodes = initializeInputNodes({
    cwlObject,
    readonly,
    wrappers,
  });

  const stepNodes = initializeStepNodes({
    cwlObject,
    readonly,
    wrappers,
    inputNodes,
  });

  const outputNodes = initializeOutputNodes({
    cwlObject,
    readonly,
    inputNodes,
    wrappers,
  });

  return [...inputNodes, ...stepNodes, ...outputNodes];
};
