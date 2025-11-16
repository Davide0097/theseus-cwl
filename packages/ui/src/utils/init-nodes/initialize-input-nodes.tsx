import { Position, Node as xyFlowNode } from "@xyflow/react";

import {
  EDITOR_PADDING,
  NODE_HEIGHT,
  NODE_MARGIN,
  NODE_WIDTH,
} from "@theseus-cwl/configurations";
import { Input, WorkflowOutput, WorkflowStep } from "@theseus-cwl/types";

import { InputNodeComponent } from "../../ui";
import { hexToRgba, normalizeInput, normalizeStepsIn } from "../general";

/**
 * Props common to all node initialization functions.
 */
export type BaseInitializeNodeProps<
  T extends
    | Record<string, Input>
    | Record<string, WorkflowOutput>
    | Record<string, WorkflowStep>,
> = {
  nodesInfo: T;
  color: string;
  readOnly: boolean;
  isSubWorkflow: boolean;
};

/**
 * Props for {@link initializeInputNodes}.
 */
export type InitializeInputNodesProps = BaseInitializeNodeProps<
  Record<string, Input>
> & {
  stepNodes: Array<
    xyFlowNode<{
      label: Node;
      step: WorkflowStep;
    }>
  >;
};

/**
 * Initializes input nodes.
 *
 * Takes CWL input information as {@link Inputs} and the already initialized {@link xyFlowNode[]} representing steps.
 * Returns an array of {@link xyFlowNode} objects that xyFlow uses to render the input nodes.
 */
export const initializeInputNodes = (
  props: InitializeInputNodesProps
): xyFlowNode<{ label: React.ReactNode; input?: Input }>[] => {
  const { nodesInfo, color, stepNodes, readOnly, isSubWorkflow } = props;

  const usedInputKeysInOrder: string[] = [];

  /** Calculates the positions of input nodes based on the already initialized step nodes. */
  stepNodes.forEach((stepNode) => {
    const step: WorkflowStep = stepNode.data.step;

    if (!step.in) {
      console.warn(`Step with id ${step.id} doesn't contain 'in' field`);
      return;
    }

    Object.entries(normalizeStepsIn(step.in)).forEach(
      ([stepInputKey, stepInput]) => {
        const source = stepInput?.source;
        if (!source) {
          console.warn(
            `Step ${step.id} input ${stepInputKey} doesn't contain a valid source`
          );
          return;
        }

        if (Array.isArray(source)) {
          source.forEach((sourceString) => {
            const [sourceKey] = sourceString.split("/");
            if (
              sourceKey &&
              // Other sourcekey could come from other steps and not form an input
              sourceKey in nodesInfo &&
              !usedInputKeysInOrder.includes(sourceKey)
            ) {
              usedInputKeysInOrder.push(sourceKey);
            }
          });
        } else {
          const [sourceKey] = source.split("/");

          if (
            sourceKey &&
            // Other sourcekey could come from other steps and not form an input
            sourceKey in nodesInfo &&
            !usedInputKeysInOrder.includes(sourceKey)
          ) {
            usedInputKeysInOrder.push(sourceKey);
          }
        }
      }
    );
  });

  const allInputKeys = Object.keys(nodesInfo);
  const unusedInputs = allInputKeys.filter(
    (key) => !usedInputKeysInOrder.includes(key)
  );

  const sortedInputKeys = [...usedInputKeysInOrder, ...unusedInputs];

  const inputNodes: xyFlowNode<{ label: React.ReactNode; input?: Input }>[] =
    sortedInputKeys.map((key, index) => {
      const input = normalizeInput(nodesInfo[key]!);

      return {
        id: key,
        targetPosition: Position.Left,
        sourcePosition: Position.Bottom,
        data: {
          input: input,
          label: (
            <InputNodeComponent
              isSubWorkflow={isSubWorkflow}
              mode="input"
              input={{ ...input, __key: key }}
              color={color}
            />
          ),
        },
        extent: "parent",
        position: {
          x: NODE_MARGIN + index * (NODE_WIDTH + NODE_MARGIN) + EDITOR_PADDING,
          y: NODE_MARGIN + EDITOR_PADDING,
        },
        draggable: !readOnly,
        style: {
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          boxShadow: "4px 4px 16px rgba(0, 0, 0, 0.05)",
          background: hexToRgba(color, 0.3),
          margin: "0px",
          padding: "0px",
          border: "1px solid rgba(0, 0, 0, 0.60)",
          borderRadius: "6px",
        },
      };
    });

  if (!readOnly) {
    const placeholderNode: xyFlowNode<{
      label: React.ReactNode;
      input?: Input;
    }> = {
      id: "__new_input_placeholder__",
      type: "input",
      data: {
        label: <InputNodeComponent mode="placeholder" color={color} />,
      },
      extent: "parent",
      position: {
        x:
          NODE_MARGIN +
          sortedInputKeys.length * (NODE_WIDTH + NODE_MARGIN) +
          EDITOR_PADDING,
        y: NODE_MARGIN + EDITOR_PADDING,
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

    inputNodes.push(placeholderNode);
  }
  if (isSubWorkflow) {
    const scale = 0.6;

    inputNodes.forEach((node) => {
      node.style = {
        ...node.style,
        width: NODE_WIDTH * scale,
        height: NODE_HEIGHT * scale,
      };

      node.position = {
        x: node.position.x * scale,
        y: node.position.y * scale,
      };
    });
  }

  return inputNodes;
};
