import { Node as xyFlowNode } from "@xyflow/react";
import {
  EDITOR_PADDING,
  NODE_HEIGHT,
  NODE_MARGIN,
  NODE_WIDTH,
} from "@theseus-cwl/configurations";
import { InputNodeComponent } from "../../ui/components/input-node";
import { CWLObject, CWLWorkflow } from "../../ui";

import "@xyflow/react/dist/style.css";
import { getWrapperNode } from "./get-wrapper-node";

/**
 * Generate CWL input nodes for the flow
 *
 * @param {CWLWorkflow} cwlWorkflow
 
 *
 * @returns {xyFlowNode[]}
 */
export function initializeInputNodes(
cwlObject: CWLObject,

  addInput?: () => void,
  colors?: Record<string, any>,
  wrappers?: boolean
): xyFlowNode[] {
  const inputNodes: xyFlowNode[] = Object.entries(
    cwlObject.inputs
  ).map(([key, input], index) => {
    const nodeId = key;

    return {
      id: nodeId,
      type: "input",
      data: {
        label: <InputNodeComponent input={{...input, key: key}}  nodeId={nodeId} />,
      },
      extent: "parent",
      position: {
        x: NODE_MARGIN + index * (NODE_WIDTH + NODE_MARGIN) + EDITOR_PADDING,
        y: NODE_MARGIN + EDITOR_PADDING,
      },
      style: {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        backgroundColor: colors?.input,
      },
    };
  });

  // Add placeholder node for creating a new input
  const placeholderNode: xyFlowNode = {
    id: "__new_input_placeholder__",
    type: "input",
    data: {
      label: (
        <InputNodeComponent input={undefined} onAddInputNode={addInput} />
      ),
    },
    extent: "parent",
    position: {
      x:
        NODE_MARGIN +
        Object.entries(cwlObject.inputs).length *
          (NODE_WIDTH + NODE_MARGIN) +
        EDITOR_PADDING,
      y: NODE_MARGIN + EDITOR_PADDING,
    },
    style: {
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      opacity: 0.5,
      borderStyle: "dashed",
      cursor: "pointer",
    },
  };

  let resultingNodes = [];

  resultingNodes = [...inputNodes, placeholderNode];

  if (wrappers) {
    const wrapperNode = getWrapperNode([...inputNodes, placeholderNode]);
    resultingNodes.push(wrapperNode);
  }

  return resultingNodes;
}
