import { Node as xyFlowNode } from "@xyflow/react";

import { NODE_HEIGHT } from "@theseus-cwl/configurations";

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
 * used to align the subworkflows to the source step node
 */
export const applyOffsetBasedOnLinkedNode = (
  nodes: xyFlowNode[],
  mainWorkflowNode: xyFlowNode,
  scalingFactor: number,
) => {
  if (nodes.length === 0) {
    return nodes;
  }

  const mainCenterY =
    mainWorkflowNode.position.y +
    getNumericHeight(mainWorkflowNode.style?.height) / 2 -
    // Remove half of the subworkflow node
    (NODE_HEIGHT * scalingFactor) / 2;
  const minSubY = Math.min(...nodes.map((node) => node.position.y));
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
