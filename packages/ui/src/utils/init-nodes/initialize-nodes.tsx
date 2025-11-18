import { Node as xyFlowNode } from "@xyflow/react";
import { ReactNode } from "react";

import {
  EDITOR_PADDING,
  SUBWORKFLOW_NODE_SCALING_FACTOR,
} from "@theseus-cwl/configurations";
import {
  CWLPackedDocument,
  Input,
  Workflow,
  WorkflowOutput,
  WorkflowStep,
} from "@theseus-cwl/types";

import { ColorState } from "../../hooks";
import {
  applyOffset,
  applyoffsetBasedOnLinkedNode,
  getMainWorkflow,
  getMaxRight,
  getWrapperNode,
  isPackedDocument,
} from "../general";
import { initializeInputNodes } from "./initialize-input-nodes";
import { initializeOutputNodes } from "./initialize-output-nodes";
import { initializeStepNodes } from "./initialize-step-nodes";

/**
 * The config for {@link initializeSingleWorkflowNodes}.
 */
export type initializeSingleWorkflowNodesConfig = {
  cwlFile: Workflow;
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
): xyFlowNode<{
  label?: ReactNode;
  input?: Input;
  step?: WorkflowStep;
  output?: WorkflowOutput;
}>[] => {
  const {
    cwlFile: workflow,
    colors,
    wrappers,
    readOnly,
    labels,
    isSubWorkflow,
  } = props;

  let nodes = [];

  const sortedStepNodes = initializeStepNodes({
    nodesInfo: workflow.steps || {},
    color: colors.step,
    isSubWorkflow,
    readOnly,
    cwlFile: workflow,
  });

  const inputNodes = initializeInputNodes({
    nodesInfo: workflow.inputs!,
    color: colors.input,
    sortedStepNodes,
    isSubWorkflow,
    readOnly,
    cwlFile: workflow,
  });

  const outputNodes = initializeOutputNodes({
    nodesInfo: workflow.outputs!,
    color: colors.output,
    sortedStepNodes,
    isSubWorkflow,
    readOnly,
    cwlFile: workflow,
  });

  nodes = [...inputNodes, ...sortedStepNodes, ...outputNodes];

  if (wrappers) {
    const maxRight = getMaxRight(nodes);
    const wrapperNodes: xyFlowNode<{
      label?: ReactNode;
      input?: Input;
      step?: WorkflowStep;
      output?: WorkflowOutput;
    }>[] = [
      getWrapperNode({
        nodes: inputNodes,
        maxRight: maxRight,
        label: labels && workflow.id ? workflow.id : undefined,
        isSubWorkflow: isSubWorkflow,
      }),
      getWrapperNode({
        nodes: sortedStepNodes,
        maxRight: maxRight,
        label: undefined,
        isSubWorkflow: isSubWorkflow,
      }),
      getWrapperNode({
        nodes: outputNodes,
        maxRight: maxRight,
        label: undefined,
        isSubWorkflow: isSubWorkflow,
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
  cwlFile: Workflow | CWLPackedDocument;
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
 * @returns {xyFlowNode<{label: React.ReactNode; input?: Input;step?: WorkflowStep;output?: WorkflowOutput;}>[]} returns
 * the corresponding array of {@link xyFlowNode} representing the visual map.
 */
export const initializeNodes = (
  props: InitializeNodesProps,
): xyFlowNode<{
  label?: React.ReactNode;
  input?: Input;
  step?: WorkflowStep;
  output?: WorkflowOutput;
}>[] => {
  const { cwlFile } = props;

  if (!isPackedDocument(cwlFile)) {
    return initializeSingleWorkflowNodes({
      ...props,
      cwlFile: cwlFile,
      isSubWorkflow: false,
      mainWorkflowNode: undefined,
    });
  } else {
    const allNodes: xyFlowNode<{
      label?: React.ReactNode;
      input?: Input;
      step?: WorkflowStep;
      output?: WorkflowOutput;
    }>[] = [];

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
      ...Object.values(cwlFile.$graph).filter((w) => w !== mainWorkflow),
    ] as Workflow[];

    const mainWorkflowNodes = initializeSingleWorkflowNodes({
      ...props,
      cwlFile: mainWorkflow,
      isSubWorkflow: false,
      mainWorkflowNode: undefined,
    });
    allNodes.push(...mainWorkflowNodes);

    let currentOffsetX = getMaxRight(mainWorkflowNodes) + EDITOR_PADDING * 2;

    // Initialize subworkflows and apply an x offset based on the previous worflow width
    workflows.slice(1).forEach((workflow) => {
      const mainWorkflowNode = mainWorkflowNodes.find(
        (n) => n.data?.step?.run === workflow.id,
      );

      if (!mainWorkflowNode) {
        console.warn("");
        return;
      }

      const nodes = initializeSingleWorkflowNodes({
        ...props,
        cwlFile: workflow,
        isSubWorkflow: true,
        mainWorkflowNode: mainWorkflowNode,
      });

      const scaledNodes = nodes.map((node) => {
        node.style = {
          ...node?.style,
          width:
            Number(node.style?.width) *
            (props.subWorkflowScalingFactor || SUBWORKFLOW_NODE_SCALING_FACTOR),
          height:
            Number(node.style?.height) *
            (props.subWorkflowScalingFactor || SUBWORKFLOW_NODE_SCALING_FACTOR),
        };

        node.position = {
          x:
            node?.position?.x *
            (props.subWorkflowScalingFactor || SUBWORKFLOW_NODE_SCALING_FACTOR),
          y:
            node?.position?.y *
            (props.subWorkflowScalingFactor || SUBWORKFLOW_NODE_SCALING_FACTOR),
        };
        return node;
      });

      let shiftedNodes = applyOffset(scaledNodes, currentOffsetX, 0);
      shiftedNodes = applyoffsetBasedOnLinkedNode(
        shiftedNodes,
        mainWorkflowNode,
      );
      allNodes.push(...shiftedNodes);

      currentOffsetX =
        getMaxRight(shiftedNodes) +
        EDITOR_PADDING * SUBWORKFLOW_NODE_SCALING_FACTOR;
    });

    return allNodes;
  }
};
