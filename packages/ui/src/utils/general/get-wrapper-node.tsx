import { Node as xyflowNode } from "@xyflow/react";

import { EDITOR_PADDING } from "@theseus-cwl/configurations";

import { getMaxBottom } from ".";

export const getWrapperNode = (
  nodes: xyflowNode[],
  maxRight: number,
  label?: string,
  isSubWorkflow?: boolean
) => {
  let maxWidth = maxRight;
  let   maxHeight = getMaxBottom(nodes);

  if (isSubWorkflow){
    maxWidth = maxRight * 0.5;
    maxHeight= maxHeight * 0.5;
  }

  return {
    id: `wrapper-for-${nodes[0]?.type}-nodes-of-worflow-${nodes[0]?.id}`,
    // should be group for dragging issues ?
    type: "input",
    data: {
      label: (
        <h1
       className="wrapper-label"
        >
          {label || ''}
        </h1>
      ),
    },
    draggable: false,
    position: { x: EDITOR_PADDING, y: EDITOR_PADDING },
    style: {
      width: maxWidth,
      height: maxHeight,
      pointerEvents: "none",
      borderRadius: "6px",
      background: "transparent",
      border: `1px dashed gray`,
    },
    zIndex: -1,
  } as xyflowNode;
};
