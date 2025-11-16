import { Node as xyFlowNode } from "@xyflow/react";

import { NODE_MARGIN } from "@theseus-cwl/configurations";
import { CWLPackedDocument, Workflow } from "@theseus-cwl/types";

import { ColorState } from "../../hooks";
import { getMaxRight, getWrapperNode } from "../general";
import {
  applyOffset,
  applyoffsetBasedOnLinkedNode,
} from "../general/apply-offset";

import { getMainWorkflow } from "../general/get-main-worflow";
import { isPackedWorkflow } from "../general/is-packed-worflow";
import { initializeInputNodes } from "./initialize-input-nodes";
import { initializeOutputNodes } from "./initialize-output-nodes";
import { initializeStepNodes } from "./initialize-step-nodes";

/**
 * Initializes the nodes for a single workflow, it can be only worflow in the file or a subworflow when is packed document.
 */
const initializeSingleWorkflowNodes = (
  props: InitializeNodesConfig
): xyFlowNode[] => {
  const {
    cwlFile: workflow,
    colors,
    wrappers,
    readOnly,
    labels,
    isSubWorkflow,


  } = props;

  let nodes = [];

  const stepNodes = initializeStepNodes({
    nodesInfo: workflow.steps || {},
    color: colors.steps,
    isSubWorkflow,
    readOnly,
  });

  const inputNodes = initializeInputNodes({
    nodesInfo: workflow.inputs!,
    color: colors.input,
    stepNodes,
    isSubWorkflow,
    readOnly,
  });

  const outputNodes = initializeOutputNodes({
    nodesInfo: workflow.outputs!,
    color: colors.output,
    stepNodes,
    isSubWorkflow,
    readOnly,
  });

  nodes = [...inputNodes, ...stepNodes, ...outputNodes];

  if (wrappers && !isSubWorkflow) {
    const maxRight = getMaxRight(nodes);
    const wrapperNodes: xyFlowNode[] = [
      getWrapperNode(
        inputNodes,
        maxRight,
        labels && workflow.id ? workflow.id : undefined,
        isSubWorkflow
      ),
      getWrapperNode(stepNodes, maxRight, undefined, isSubWorkflow),
      getWrapperNode(outputNodes, maxRight, undefined, isSubWorkflow),
    ];
    nodes.push(...wrapperNodes);
  }

  return nodes;
};

/**
 * The config for {@link initializeNodes}.
 */
export type InitializeNodesConfig = {
  cwlFile: Workflow | CWLPackedDocument;
  wrappers: boolean;
  colors: ColorState;
  readOnly: boolean;
  labels: boolean;
  isSubWorkflow: boolean;
  mainWorkflowNode?: xyFlowNode;
};

/**
 * Initializes the nodes.
 *
 * @param {Omit<InitializeNodesConfig, 'isSubWorkflow'| 'mainWorkflow'>} props
 *
 * @returns {xyFlowNode[]} returns the corresponding array of {@link xyFlowNode} representing the visual map.
 */
export const initializeNodes = (
  props: Omit<InitializeNodesConfig, "isSubWorkflow" | "mainWorkflow">
): xyFlowNode[] => {
  const { cwlFile } = props;

  if (!isPackedWorkflow(cwlFile)) {
    return initializeSingleWorkflowNodes({
      ...props,
      isSubWorkflow: false,
      mainWorkflowNode: undefined,
    });
  } else {
    const mainWorkflow = getMainWorkflow(cwlFile);

    if (!mainWorkflow) {
      return [];
    }

    const workflows = [
      mainWorkflow,
      ...cwlFile.$graph.filter((w) => w !== mainWorkflow),
    ] as Workflow[];

    const allNodes: xyFlowNode[] = [];

    // Initialize main workflow first
    const mainWorkflowNodes = initializeSingleWorkflowNodes({
      ...props,
      cwlFile: mainWorkflow,
      isSubWorkflow: false,
      mainWorkflowNode: undefined,
    });
    allNodes.push(...mainWorkflowNodes);

    let currentOffsetX = getMaxRight(mainWorkflowNodes) + NODE_MARGIN;

    // Initialize subworkflows and apply an x offset based on the previous worflow width
    workflows.slice(1).forEach((workflow) => {
      const mainWorkflowNode = mainWorkflowNodes.find(
        (n) => n.data?.label?.props?.step?.run === workflow.id
      );

      const nodes = initializeSingleWorkflowNodes({
        ...props,
        cwlFile: workflow,
        isSubWorkflow: true,
        mainWorkflowNode: mainWorkflowNode,
      });

      let shiftedNodes = applyOffset(nodes, currentOffsetX, 0);
      shiftedNodes = applyoffsetBasedOnLinkedNode(
        shiftedNodes,
        mainWorkflowNode
      );
      allNodes.push(...shiftedNodes);
      currentOffsetX = getMaxRight(shiftedNodes);
    });

    return allNodes;
  }
};
