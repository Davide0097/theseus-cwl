import { Node as xyFlowNode } from "@xyflow/react";

import {
  NODE_HEIGHT,
  NODE_MARGIN,
  NODE_WIDTH,
} from "@theseus-cwl/configurations";
import { Outputs, Step } from "@theseus-cwl/types";

import { OutputNodeComponent } from "../../ui";
import { getMaxBottom, getMaxRight, hexToRgba } from "../general";
import { BaseInitializeNodeProps } from "./initialize-input-nodes";

/**
 * Props for {@link initializeOutputNodes}.
 */
export type InitializeOutputNodesProps = BaseInitializeNodeProps<Outputs> & {
  stepNodes: xyFlowNode[];
};

/**
 * Initializes output nodes.
 *
 * Takes CWL output information as {@link Outputs} and the already initialized {@link xyFlowNode[]} representing the steps.
 * Returns an array of {@link xyFlowNode} objects that xyFlow uses to render the output nodes.
 */
export const initializeOutputNodes = (
  props: InitializeOutputNodesProps
): xyFlowNode[] => {
  const { nodesInfo, color, stepNodes, readOnly } = props;

  const outputNodes: xyFlowNode[] = [];

  Object.entries(nodesInfo).forEach(([key, output]) => {
    let matchedStepNode: xyFlowNode | undefined;

    for (const stepNode of stepNodes) {
      const step: Step | undefined = (
        stepNode?.data?.label as { props?: { step?: Step } }
      )?.props?.step;

      if (output.outputSource?.split("/")[0] === step?.__key) {
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
        label: (
          <OutputNodeComponent
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
    const placeholderNode: xyFlowNode = {
      id: "__new_output_placeholder__",
      data: {
        label: <OutputNodeComponent mode="placeholder" color={color} />,
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

  return outputNodes;
};
