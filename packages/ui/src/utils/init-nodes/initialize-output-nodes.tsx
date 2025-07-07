import { Node as xyFlowNode } from "@xyflow/react";

import {
  EDITOR_PADDING,
  NODE_HEIGHT,
  NODE_MARGIN,
  NODE_WIDTH,
} from "@theseus-cwl/configurations";

import { Output, Outputs, Steps, CWLWorkflow, CWLObject } from "../../ui";

import { getWrapperNode } from "./get-wrapper-node";
import { OutputNodeComponent } from "../../ui/components";

const getOutpuNodesPositon = (
  output: Output,
  key: string,
  steps: Steps,
  outputs: Outputs
): { x: number; y: number } => {
  const source = output.outputSource?.split("/")[0];

  let relatedStepIndex = -1;
  steps.forEach((step, index) => {
    if (step.id === source) {
      relatedStepIndex = index;
    }
  });

  if (relatedStepIndex !== -1) {
    const x =
      NODE_MARGIN +
      relatedStepIndex * (NODE_WIDTH + NODE_MARGIN) +
      EDITOR_PADDING;

    const lastStepIndex = steps.length;
    const y =
      EDITOR_PADDING +
      NODE_MARGIN +
      NODE_HEIGHT +
      lastStepIndex * (NODE_HEIGHT + NODE_MARGIN);

    return { x, y };
  } else {
    // Output not connected to a step — stack it after other such outputs
    const outputIndex =
      Object.entries(outputs).findIndex(([key, value]) => key === key) - 1;
    const x =
      NODE_MARGIN +
      (steps.length + outputIndex) * (NODE_WIDTH + NODE_MARGIN) +
      EDITOR_PADDING;

    const y =
      EDITOR_PADDING +
      NODE_MARGIN +
      NODE_HEIGHT +
      steps.length * (NODE_HEIGHT + NODE_MARGIN);

    return { x, y };
  }
};

export const initializeOutputNodes = (
 cwlObject: CWLObject,

  addOutput?: () => void,
  colors?: Record<string, string>,
  inputNodes?: xyFlowNode[],
  wrappers?: boolean
): xyFlowNode[] => {
  let resultingNodes = [];

  const nodes = Object.entries(cwlObject.outputs).map(
    ([key, value]) => ({
      id: key,
      extent: "parent",
      data: { label: <OutputNodeComponent output={value} outputId={key} /> },
      position: getOutpuNodesPositon(
        value,
        key,
        cwlObject.steps,
        cwlObject.outputs
      ),
      style: {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        backgroundColor: colors?.output,
      },
    })
  ) as xyFlowNode[];

  const allNodes = [...nodes];

  const maxXPosition = allNodes.reduce((max, node) => {
    return node.position.x > max ? node.position.x : max;
  }, 0);

  const placeholderNode: xyFlowNode = {
    id: "__new_output_placeholder__",

    data: {
      label: <OutputNodeComponent onAddOutputNode={addOutput} />,
    },
    extent: "parent",
    position: {
      x: maxXPosition + NODE_WIDTH + NODE_MARGIN,
      y: Math.max(...nodes.map((n) => n.position.y)),
    },

    style: {
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      opacity: 0.5,
      borderStyle: "dashed",
      cursor: "pointer",
    },
  };

  resultingNodes = [...nodes, placeholderNode];

  if (wrappers) {
    const wrapperNode = getWrapperNode([
      ...nodes,
      placeholderNode,
      ...inputNodes,
    ]);
    resultingNodes.push(wrapperNode);
  }

  return resultingNodes;
};
