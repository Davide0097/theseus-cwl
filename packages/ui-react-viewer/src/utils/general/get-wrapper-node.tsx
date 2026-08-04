import { Node as xyflowNode } from "@xyflow/react";

import { VIEWER_PADDING } from "@theseus-cwl/configurations";

import { getMaxBottom } from "./get-max-bottom";
import { CwlNodeData, CwlNodeType } from "../../ui";

export type GetWrapperNodeProps = {
  nodes: xyflowNode[];
  maxRight: number;
  label?: string;
};

export const getWrapperNode = (
  props: GetWrapperNodeProps,
): xyflowNode<CwlNodeData> => {
  const { nodes, maxRight, label } = props;

  return {
    id: `wrapper-for-${nodes[0]?.type}-nodes-of-workflow-${nodes[0]?.id}`,
    type: CwlNodeType.WRAPPER,
    data: {
      label: label ?? "",
    },
    draggable: false,
    position: { x: VIEWER_PADDING, y: VIEWER_PADDING },
    style: {
      width: maxRight,
      height: getMaxBottom(nodes),
      pointerEvents: "none",
      borderRadius: "6px",
      background: "transparent",
      border: `1px dashed gray`,
    },
    zIndex: -1,
  };
};
