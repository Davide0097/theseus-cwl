import { Node as xyflowNode } from "@xyflow/react";

import { VIEWER_PADDING } from "@theseus-cwl/configurations";

import { getMaxBottom } from ".";

export type GetWrapperNodeProps = {
  nodes: xyflowNode[];
  maxRight: number;
  label?: string;
  isSubWorkflow?: boolean;
};

export const getWrapperNode = (props: GetWrapperNodeProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { nodes, maxRight, label, isSubWorkflow } = props;

  const maxWidth = maxRight;
  const maxHeight = getMaxBottom(nodes);

  return {
    id: `wrapper-for-${nodes[0]?.type}-nodes-of-worflow-${nodes[0]?.id}`,
    type: "input",
    data: {
      label: <h1 className="wrapper-label">{label || ""}</h1>,
    },
    draggable: false,
    position: { x: VIEWER_PADDING, y: VIEWER_PADDING },
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
