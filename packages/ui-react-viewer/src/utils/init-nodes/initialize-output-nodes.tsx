import { Node as xyFlowNode } from "@xyflow/react";

import {
  NODE_HEIGHT,
  NODE_MARGIN,
  NODE_WIDTH,
  VIEWER_PADDING,
} from "@theseus-cwl/configurations";
import { Output, Process, WorkflowOutput } from "@theseus-cwl/types";

import {
  getId,
  getMaxBottom,
  getMaxRight,
  getNodeStyle,
  getPlaceholderNodeStyle,
  getSourceKeys,
} from "../general";
import { BaseInitializeNodeProps } from "./initialize-input-nodes";
import { CwlNodeData, CwlNodeType } from "../../ui";

/**
 * Props for {@link initializeOutputNodes}.
 */
export type InitializeOutputNodesProps = BaseInitializeNodeProps & {
  nodesInfo: Record<string, WorkflowOutput>;
  sortedStepNodes: xyFlowNode<CwlNodeData>[];
  isSubWorkflow: boolean;
};

/**
 * Initializes output nodes.
 *
 * Takes CWL output information and the already initialized step nodes, and
 * returns the {@link xyFlowNode} objects that xyFlow uses to render the output nodes.
 */
export const initializeOutputNodes = (
  props: InitializeOutputNodesProps,
): xyFlowNode<CwlNodeData>[] => {
  const {
    nodesInfo,
    color,
    sortedStepNodes,
    readOnly,
    isSubWorkflow,
    cwlFile,
  } = props;

  const outputNodes: xyFlowNode<CwlNodeData>[] = [];

  Object.entries(nodesInfo).forEach(([key, output]) => {
    let matchedStepNode: xyFlowNode<CwlNodeData> | undefined;

    const sourceStepKey = getSourceKeys(output.outputSource)[0];

    for (const stepNode of sortedStepNodes) {
      const step = stepNode.data.step;

      if (!step) {
        return;
      }

      if (sourceStepKey === step.id) {
        matchedStepNode = stepNode;
        break;
      }
    }

    const position = matchedStepNode
      ? {
          x: matchedStepNode.position.x,
          y: getMaxBottom(sortedStepNodes) + NODE_MARGIN + NODE_MARGIN,
        }
      : {
          x: getMaxRight(sortedStepNodes) + NODE_MARGIN,
          y: getMaxBottom(sortedStepNodes) + NODE_MARGIN + NODE_MARGIN,
        };

    outputNodes.push({
      id: getId(cwlFile.id, key),
      type: CwlNodeType.OUTPUT,
      extent: "parent",
      data: { output, isSubWorkflow },
      draggable: !readOnly,
      position,
      style: getNodeStyle(color),
    });
  });

  if (!readOnly) {
    outputNodes.push({
      id: getId(cwlFile.id, "__new_output_placeholder__"),
      type: CwlNodeType.OUTPUT,
      data: { isSubWorkflow },
      extent: "parent",
      position: {
        x: getMaxRight(outputNodes) + NODE_MARGIN,
        y: getMaxBottom(outputNodes) - NODE_HEIGHT,
      },
      style: getPlaceholderNodeStyle(color),
    });
  }

  return outputNodes;
};

/**
 * Props for {@link initializeProcessOutputNodes}.
 */
export type InitializeProcessOutputNodesProps = {
  color: string;
  readOnly: boolean;
  isSubWorkflow: boolean;
  cwlFile: Process;
  nodesInfo: Record<string, Output>;
  sortedInputNodes: xyFlowNode<CwlNodeData>[];
};

/**
 * Initializes Process output nodes.
 *
 * Takes CWL output information and the already initialized input nodes, and
 * returns the {@link xyFlowNode} objects that xyFlow uses to render the output nodes.
 */
export const initializeProcessOutputNodes = (
  props: InitializeProcessOutputNodesProps,
): xyFlowNode<CwlNodeData>[] => {
  const {
    nodesInfo,
    color,
    sortedInputNodes,
    readOnly,
    isSubWorkflow,
    cwlFile,
  } = props;

  const outputNodes: xyFlowNode<CwlNodeData>[] = [];

  const baseY =
    sortedInputNodes.length > 0
      ? getMaxBottom(sortedInputNodes) + NODE_MARGIN * 2
      : NODE_MARGIN + VIEWER_PADDING;

  const outputEntries = Object.entries(nodesInfo);

  outputEntries.forEach(([key, output], index) => {
    outputNodes.push({
      id: getId(cwlFile.id, key),
      type: CwlNodeType.OUTPUT,
      extent: "parent",
      data: { output: { ...output, id: key }, isSubWorkflow },
      draggable: !readOnly,
      position: {
        x: NODE_MARGIN + index * (NODE_WIDTH + NODE_MARGIN) + VIEWER_PADDING,
        y: baseY,
      },
      style: getNodeStyle(color),
    });
  });

  if (!readOnly) {
    outputNodes.push({
      id: getId(cwlFile.id, "__new_output_placeholder__"),
      type: CwlNodeType.OUTPUT,
      data: { isSubWorkflow },
      extent: "parent",
      position: {
        x: NODE_MARGIN,
        y: baseY,
      },
      style: getPlaceholderNodeStyle(color),
    });
  }

  return outputNodes;
};
