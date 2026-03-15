import { Node as xyFlowNode } from "@xyflow/react";

import {
  NODE_HEIGHT,
  SUBWORKFLOW_NODE_SCALING_FACTOR,
} from "@theseus-cwl/configurations";

/**
 * Apply offset to nodes (e.g., to position subsequent workflows below or beside previous ones)
 */
export const applyOffset = (
  nodes: xyFlowNode[],
  offsetX?: number,
  offsetY?: number,
): xyFlowNode[] =>
  nodes.map((node) => ({
    ...node,
    position: {
      x: node.position.x + (offsetX || 0),
      y: node.position.y + (offsetY || 0),
    },
  }));

/**
 * Align subworkflow nodes vertically to the center of a specific node,
 * used to allign the subworflows to the source step node
 */
export const applyoffsetBasedOnLinkedNode = (
  nodes: xyFlowNode[],
  mainWorkflowNode: xyFlowNode,
) => {
  const mainCenterY =
    mainWorkflowNode?.position?.y +
    getNumericHeight(mainWorkflowNode?.style?.height) / 2 -
    // Remove half of the subworflow node
    (NODE_HEIGHT * SUBWORKFLOW_NODE_SCALING_FACTOR) / 2;
  const minSubY = Math.min(...nodes.map((n) => n.position.y));
  const offsetY = mainCenterY - minSubY;

  return applyOffset(nodes, 0, offsetY);
};

const getNumericHeight = (height: string | number | undefined): number => {
  if (typeof height === "number") return height;
  if (typeof height === "string") {
    const parsed = parseFloat(height);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};
