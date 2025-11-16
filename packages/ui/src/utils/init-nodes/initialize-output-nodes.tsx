import { Node as xyFlowNode } from "@xyflow/react";
import { ReactNode } from "react";

import {
  NODE_HEIGHT,
  NODE_MARGIN,
  NODE_WIDTH,
} from "@theseus-cwl/configurations";
import { WorkflowOutput, WorkflowStep } from "@theseus-cwl/types";

import { OutputNodeComponent } from "../../ui";
import { getMaxBottom, getMaxRight, hexToRgba } from "../general";
import { BaseInitializeNodeProps } from "./initialize-input-nodes";

/**
 * Props for {@link initializeOutputNodes}.
 */
export type InitializeOutputNodesProps = BaseInitializeNodeProps<
  Record<string, WorkflowOutput>
> & {
  stepNodes: xyFlowNode<{ label: ReactNode; step?: WorkflowStep }>[];
  isSubWorkflow: boolean;
};

/**
 * Initializes output nodes.
 *
 * Takes CWL output information as {@link Outputs} and the already initialized {@link xyFlowNode[]} representing the steps.
 * Returns an array of {@link xyFlowNode} objects that xyFlow uses to render the output nodes.
 */
export const initializeOutputNodes = (
  props: InitializeOutputNodesProps
): xyFlowNode<{ label: ReactNode; output?: WorkflowOutput }>[] => {
  const { nodesInfo, color, stepNodes, readOnly, isSubWorkflow } = props;

  const outputNodes: xyFlowNode<{
    label: ReactNode;
    output?: WorkflowOutput;
  }>[] = [];

  Object.entries(nodesInfo).forEach(([key, output]) => {
    let matchedStepNode:
      | xyFlowNode<{ label: ReactNode; output?: WorkflowOutput }>
      | undefined;

    for (const stepNode of stepNodes) {
      const step: WorkflowStep | undefined = stepNode.data.step;

      if (!step) {
        return;
      }

      if (output.outputSource?.split("/")[0] === step.__key) {
        matchedStepNode = stepNode;
        break;
      }
    }

    const position = matchedStepNode
      ? {
          x: matchedStepNode.position.x,
          y: getMaxBottom(stepNodes) + NODE_MARGIN + NODE_MARGIN,
        }
      : {
          x: getMaxRight(stepNodes) + NODE_MARGIN,
          y: getMaxBottom(stepNodes) + NODE_MARGIN + NODE_MARGIN,
        };

    outputNodes.push({
      id: key,
      extent: "parent",
      data: {
        output: output,
        label: (
          <OutputNodeComponent
            isSubWorkflow={isSubWorkflow}
            output={{ ...output, __key: key }}
            mode="output"
            color={color}
          />
        ),
      },
      draggable: !readOnly,
      position,
      style: {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        margin: "0px",
        borderRadius: "6px",
        padding: "0px",
        border: "1px solid rgba(0, 0, 0, 0.60)",
        boxShadow: "4px 4px 16px rgba(0, 0, 0, 0.05)",
        background: hexToRgba(color, 0.3),
      },
    });
  });

  if (!readOnly) {
    const placeholderNode: xyFlowNode<{
      label: ReactNode;
      output?: WorkflowOutput;
    }> = {
      id: "__new_output_placeholder__",
      data: {
        label: (
          <OutputNodeComponent
            mode="placeholder"
            color={color}
            isSubWorkflow={isSubWorkflow}
          />
        ),
      },
      extent: "parent",
      position: {
        x: getMaxRight(outputNodes) + NODE_MARGIN,
        y: getMaxBottom(outputNodes) - NODE_HEIGHT,
      },
      style: {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        backgroundColor: hexToRgba(color, 0.2),
        borderStyle: "dashed",
        cursor: "pointer",
        margin: "0px",
        padding: "0px",
      },
    };

    outputNodes.push(placeholderNode);
  }

  if (isSubWorkflow) {
    const scale = 0.6;

    outputNodes.forEach((node) => {
      node.style = {
        ...node.style,
        width: NODE_WIDTH * scale,
        height: NODE_HEIGHT * scale,
      };

      node.position = {
        x: node.position.x,
        y: node.position.y * scale + NODE_HEIGHT,
      };
    });
  }

  return outputNodes;
};
