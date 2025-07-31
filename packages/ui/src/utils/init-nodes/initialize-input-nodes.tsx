import { Node as xyFlowNode } from "@xyflow/react";

import {
  EDITOR_PADDING,
  NODE_HEIGHT,
  NODE_MARGIN,
  NODE_WIDTH,
} from "@theseus-cwl/configurations";
import { CWLObject } from "@theseus-cwl/types";

import { InputNodeComponent } from "../../ui";
import { getWrapperNode } from "./get-wrapper-node";

import "@xyflow/react/dist/style.css";

export type InitializeInputNodesProps = {
  cwlObject: CWLObject;
  readonly: boolean;
  wrappers: boolean;
};

export const initializeInputNodes = (props: InitializeInputNodesProps) => {
  const { cwlObject, readonly, wrappers } = props;

  const inputNodes: xyFlowNode[] = Object.entries(cwlObject.inputs).map(
    ([key, input], index) => {
      const nodeId = key;

      return {
        id: nodeId,
        type: "input",
        data: {
          label: <InputNodeComponent input={{ ...input, __key: key }} />,
        },
        extent: "parent",
        position: {
          x: NODE_MARGIN + index * (NODE_WIDTH + NODE_MARGIN) + EDITOR_PADDING,
          y: NODE_MARGIN + EDITOR_PADDING,
        },
        style: {
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
        },
      };
    }
  );

  const placeholderNode: xyFlowNode = {
    id: "__new_input_placeholder__",
    type: "input",
    data: {
      label: <InputNodeComponent input={undefined} />,
    },
    extent: "parent",
    position: {
      x:
        NODE_MARGIN +
        Object.entries(cwlObject.inputs).length * (NODE_WIDTH + NODE_MARGIN) +
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

  const resultingNodes = [...inputNodes];

  if (!readonly) {
    resultingNodes.push(placeholderNode);
  }

  if (wrappers) {
    const wrapperNode = getWrapperNode([...inputNodes, placeholderNode]);
    resultingNodes.push(wrapperNode);
  }

  return resultingNodes;
};
