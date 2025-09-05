import { Node as xyflowNode } from "@xyflow/react";

import { EDITOR_PADDING } from "@theseus-cwl/configurations";

import { getMaxBottom } from ".";

export const getWrapperNode = (nodes: xyflowNode[], maxRight: number) => {
  const maxWidth = maxRight;
  const maxHeight = getMaxBottom(nodes);

  return {
    id: `wrapper-for-${nodes[0]?.type}-nodes`,
    type: "group",
    draggable: false,
    position: { x: EDITOR_PADDING, y: EDITOR_PADDING },
    style: {
      width: maxWidth,
      height: maxHeight,
      pointerEvents: "none",
      borderRadius: "6px",
      background: "transparent",
      border: `2px dashed gray`,
    },
    zIndex: -1,
  } as xyflowNode;
};
