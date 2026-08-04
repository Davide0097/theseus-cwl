import { Node as xyFlowNode } from "@xyflow/react";

import {
  SUBWORKFLOW_NODE_SCALING_FACTOR,
  VIEWER_PADDING,
} from "@theseus-cwl/configurations";
import { isPackedDocument, isWorkflow } from "@theseus-cwl/parser";
import { CWLPackedDocument, Process, Workflow } from "@theseus-cwl/types";

import { ColorState } from "../../hooks";
import { CwlNodeData } from "../../ui";
import {
  applyOffset,
  applyOffsetBasedOnLinkedNode,
  getMainWorkflow,
  getMaxRight,
  getWrapperNode,
  isRunReferenceTo,
} from "../general";
import {
  initializeInputNodes,
  initializeProcessInputNodes,
} from "./initialize-input-nodes";
import {
  initializeOutputNodes,
  initializeProcessOutputNodes,
} from "./initialize-output-nodes";
import { initializeStepNodes } from "./initialize-step-nodes";

/**
 * The config for {@link initializeSingleWorkflowNodes}.
 */
export type initializeSingleWorkflowNodesConfig = {
  cwlFile: Workflow | Process;
  wrappers: boolean;
  colors: ColorState;
  readOnly: boolean;
  labels: boolean;
  isSubWorkflow: boolean;
  mainWorkflowNode?: xyFlowNode;
  subWorkflowScalingFactor?: number;
};

/**
 * Initializes the nodes for a single workflow
 */
const initializeSingleWorkflowNodes = (
  props: initializeSingleWorkflowNodesConfig,
): xyFlowNode<CwlNodeData>[] => {
  const {
    cwlFile: workflow,
    colors,
    wrappers,
    readOnly,
    labels,
    isSubWorkflow,
  } = props;

  let nodes: xyFlowNode<CwlNodeData>[] = [];
  let inputNodes: xyFlowNode<CwlNodeData>[] = [];
  let outputNodes: xyFlowNode<CwlNodeData>[] = [];
  let stepNodes: xyFlowNode<CwlNodeData>[] = [];

  if (!isWorkflow(workflow)) {
    inputNodes = initializeProcessInputNodes({
      nodesInfo: workflow.inputs ?? {},
      color: colors.input,
      readOnly,
      cwlFile: workflow,
    });
    outputNodes = initializeProcessOutputNodes({
      nodesInfo: workflow.outputs ?? {},
      color: colors.output,
      readOnly,
      cwlFile: workflow,
      isSubWorkflow: false,
      sortedInputNodes: inputNodes,
    });

    nodes = [...inputNodes, ...outputNodes];
  } else {
    stepNodes = initializeStepNodes({
      nodesInfo: workflow.steps ?? {},
      color: colors.step,
      isSubWorkflow,
      readOnly,
      cwlFile: workflow,
    });

    inputNodes = initializeInputNodes({
      nodesInfo: workflow.inputs ?? {},
      color: colors.input,
      sortedStepNodes: stepNodes,
      isSubWorkflow,
      readOnly,
      cwlFile: workflow,
    });

    outputNodes = initializeOutputNodes({
      nodesInfo: workflow.outputs ?? {},
      color: colors.output,
      sortedStepNodes: stepNodes,
      isSubWorkflow,
      readOnly,
      cwlFile: workflow,
    });

    nodes = [...inputNodes, ...stepNodes, ...outputNodes];
  }

  if (wrappers) {
    const maxRight = getMaxRight(nodes);
    const wrapperNodes: xyFlowNode<CwlNodeData>[] = [
      getWrapperNode({
        nodes: inputNodes,
        maxRight: maxRight,
        label: labels && workflow.id ? workflow.id : undefined,
      }),
      getWrapperNode({
        nodes: stepNodes,
        maxRight: maxRight,
        label: undefined,
      }),
      getWrapperNode({
        nodes: outputNodes,
        maxRight: maxRight,
        label: undefined,
      }),
    ];
    nodes.push(...wrapperNodes);
  }

  return nodes;
};

/**
 * The config for {@link initializeNodes}.
 */
export type InitializeNodesProps = {
  cwlFile: Workflow | CWLPackedDocument | Process;
  wrappers: boolean;
  colors: ColorState;
  readOnly: boolean;
  labels: boolean;
  subWorkflowScalingFactor?: number;
};

/**
 * Initializes the nodes.
 *
 * @param {InitializeNodesProps} props
 *
 * @returns {xyFlowNode<CwlNodeData>[]} the corresponding array of {@link xyFlowNode} representing the visual map.
 */
export const initializeNodes = (
  props: InitializeNodesProps,
): xyFlowNode<CwlNodeData>[] => {
  const { cwlFile } = props;

  if (!isPackedDocument(cwlFile)) {
    return initializeSingleWorkflowNodes({
      ...props,
      cwlFile: cwlFile,
      isSubWorkflow: false,
      mainWorkflowNode: undefined,
    });
  } else {
    const allNodes: xyFlowNode<CwlNodeData>[] = [];

    const mainWorkflow = getMainWorkflow(cwlFile);

    if (!mainWorkflow) {
      console.warn(
        "CWLViewer: Could not find a main workflow in the packed document. " +
          "Ensure that the CWL file has a valid entrypoint or main workflow defined.",
      );
      return [];
    }

    const workflows = [
      mainWorkflow,
      ...Object.values(cwlFile.$graph).filter(
        (workflow) => workflow !== mainWorkflow,
      ),
    ];

    const mainWorkflowNodes = initializeSingleWorkflowNodes({
      ...props,
      cwlFile: mainWorkflow,
      isSubWorkflow: false,
      mainWorkflowNode: undefined,
    });
    allNodes.push(...mainWorkflowNodes);

    let currentOffsetX = getMaxRight(mainWorkflowNodes) + VIEWER_PADDING * 2;

    // Initialize subworkflows and apply an x offset based on the previous workflow width
    workflows.slice(1).forEach((workflow) => {
      const mainWorkflowNode = mainWorkflowNodes.find((node) =>
        isRunReferenceTo(node.data.step?.run, workflow.id),
      );

      if (!mainWorkflowNode) {
        console.warn(
          `CWLViewer: skipping $graph entry "${workflow.id}", it is not referenced by any step of the main workflow and will not be rendered.`,
        );
        return;
      }

      const nodes = initializeSingleWorkflowNodes({
        ...props,
        cwlFile: workflow,
        isSubWorkflow: true,
        mainWorkflowNode: mainWorkflowNode,
      });

      const scalingFactor =
        props.subWorkflowScalingFactor || SUBWORKFLOW_NODE_SCALING_FACTOR;

      const scaledNodes = nodes.map((node) => {
        const width = Number(node.style?.width);
        const height = Number(node.style?.height);

        return {
          ...node,
          style: {
            ...node.style,
            width: Number.isNaN(width)
              ? node.style?.width
              : width * scalingFactor,
            height: Number.isNaN(height)
              ? node.style?.height
              : height * scalingFactor,
          },
          position: {
            x: node.position.x * scalingFactor,
            y: node.position.y * scalingFactor,
          },
        };
      });

      let shiftedNodes = applyOffset(scaledNodes, currentOffsetX, 0);
      shiftedNodes = applyOffsetBasedOnLinkedNode(
        shiftedNodes,
        mainWorkflowNode,
        scalingFactor,
      );
      allNodes.push(...shiftedNodes);

      currentOffsetX =
        getMaxRight(shiftedNodes) + VIEWER_PADDING * scalingFactor;
    });

    return allNodes;
  }
};
