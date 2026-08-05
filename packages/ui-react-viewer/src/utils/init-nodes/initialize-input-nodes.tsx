import { Position, Node as xyFlowNode } from "@xyflow/react";

import {
  NODE_HEIGHT,
  NODE_MARGIN,
  NODE_WIDTH,
  VIEWER_PADDING,
} from "@theseus-cwl/configurations";
import { Input, Process, Workflow } from "@theseus-cwl/types";

import { CwlNodeData, CwlNodeType } from "../../ui";
import {
  getId,
  getNodeStyle,
  getPlaceholderNodeStyle,
  getSourceKeys,
} from "../general";

/**
 * Props common to all node initialization functions.
 */
export type BaseInitializeNodeProps = {
  color: string;
  readOnly: boolean;
  isSubWorkflow: boolean;
  cwlFile: Workflow;
};

/**
 * Props for {@link initializeInputNodes}.
 */
export type InitializeInputNodesProps = BaseInitializeNodeProps & {
  nodesInfo: Record<string, Input>;
  sortedStepNodes: xyFlowNode<CwlNodeData>[];
};

/**
 * Initializes input nodes.
 *
 * Takes CWL input information and the already initialized step nodes, and
 * returns the {@link xyFlowNode} objects that xyFlow uses to render the input nodes.
 */
export const initializeInputNodes = (
  props: InitializeInputNodesProps,
): xyFlowNode<CwlNodeData>[] => {
  const {
    nodesInfo,
    color,
    sortedStepNodes,
    readOnly,
    isSubWorkflow,
    cwlFile,
  } = props;

  const usedInputKeysInOrder: string[] = [];

  /** Calculates the positions of input nodes based on the already initialized step nodes. */
  sortedStepNodes.forEach((stepNode) => {
    const step = stepNode.data.step;

    if (!step?.in) {
      console.warn(`Step with id ${step?.id} doesn't contain 'in' field`);
      return;
    }

    Object.entries(step.in).forEach(([stepInputKey, stepInput]) => {
      if (!stepInput?.source) {
        console.warn(
          `Step ${step.id} input ${stepInputKey} doesn't contain a valid source`,
        );
        return;
      }

      getSourceKeys(stepInput.source).forEach((sourceKey) => {
        // Source keys can also reference other steps, not just workflow inputs
        if (
          sourceKey in nodesInfo &&
          !usedInputKeysInOrder.includes(sourceKey)
        ) {
          usedInputKeysInOrder.push(sourceKey);
        }
      });
    });
  });

  const allInputKeys = Object.keys(nodesInfo);
  const unusedInputs = allInputKeys.filter(
    (key) => !usedInputKeysInOrder.includes(key),
  );

  const sortedInputKeys = [...usedInputKeysInOrder, ...unusedInputs];

  const inputNodes: xyFlowNode<CwlNodeData>[] = sortedInputKeys.map(
    (key, index) => {
      const input = nodesInfo[key]!;

      return {
        id: getId(cwlFile.id, key),
        type: CwlNodeType.INPUT,
        targetPosition: isSubWorkflow ? Position.Left : Position.Bottom,
        sourcePosition: Position.Bottom,
        data: { input, isSubWorkflow },
        extent: "parent",
        position: {
          x: NODE_MARGIN + index * (NODE_WIDTH + NODE_MARGIN) + VIEWER_PADDING,
          y: NODE_MARGIN + VIEWER_PADDING,
        },
        draggable: !readOnly,
        style: getNodeStyle(color),
      };
    },
  );

  if (!readOnly) {
    inputNodes.push({
      id: getId(cwlFile.id, "__new_input_placeholder__"),
      type: CwlNodeType.INPUT,
      data: { isSubWorkflow },
      extent: "parent",
      position: {
        x:
          NODE_MARGIN +
          sortedInputKeys.length * (NODE_WIDTH + NODE_MARGIN) +
          VIEWER_PADDING,
        y: NODE_MARGIN + VIEWER_PADDING,
      },
      style: getPlaceholderNodeStyle(color),
    });
  }

  return inputNodes;
};

/**
 * Initializes process input nodes.
 */
export const initializeProcessInputNodes = (props: {
  nodesInfo: Record<string, Input>;
  color: string;
  readOnly: boolean;
  cwlFile: Process;
  isSubWorkflow: boolean;
}): xyFlowNode<CwlNodeData>[] => {
  const { nodesInfo, color, readOnly, cwlFile, isSubWorkflow } = props;

  const inputKeys = Object.keys(nodesInfo);

  const inputNodes: xyFlowNode<CwlNodeData>[] = inputKeys.map((key, index) => {
    const input = nodesInfo[key]!;

    return {
      id: getId(cwlFile.id, key),
      type: CwlNodeType.INPUT,
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
      data: { input, isSubWorkflow },
      position: {
        x: NODE_MARGIN + index * (NODE_WIDTH + NODE_MARGIN) + VIEWER_PADDING,
        y: NODE_MARGIN + VIEWER_PADDING,
      },
      draggable: !readOnly,
      style: getNodeStyle(color),
    };
  });

  if (!readOnly) {
    inputNodes.push({
      id: getId(cwlFile.id, "__new_input_placeholder__"),
      type: CwlNodeType.INPUT,
      data: { isSubWorkflow },
      position: {
        x: VIEWER_PADDING,
        y: VIEWER_PADDING + inputKeys.length * (NODE_HEIGHT + NODE_MARGIN),
      },
      style: getPlaceholderNodeStyle(color),
    });
  }

  return inputNodes;
};
