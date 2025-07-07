import { Node as xyflowNode } from "@xyflow/react";

import {
  EDITOR_PADDING,
  NODE_HEIGHT,
  NODE_MARGIN,
  NODE_WIDTH,
} from "@theseus-cwl/configurations";

export const getWrapperNode = (childNodes: xyflowNode[]) => {
  const dimensions = () => {
    if (childNodes.length === 0) {
      return { width: 0, height: 0 };
    }

    const maxRight = Math.max(
      ...childNodes.map((node) => node.position.x + NODE_WIDTH)
    );

    const maxBottom = Math.max(
      ...childNodes.map((node) => node.position.y + NODE_HEIGHT)
    );

    const width = maxRight + EDITOR_PADDING;
    const height = maxBottom + NODE_MARGIN - NODE_MARGIN;

    return { width, height };
  };

  return {
    id: `wrapper-for-${childNodes[0]?.type}-nodes`,
    type: "group",
    position: { x: EDITOR_PADDING, y: EDITOR_PADDING },
    data: { label: "" },
    style: {
      width: dimensions().width,
      height: dimensions().height,
    },
    zIndex: -1,
    draggable: true,
  } as xyflowNode;
};
