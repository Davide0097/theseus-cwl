import { NODE_HEIGHT } from "@theseus-cwl/configurations";
import { Node as xyFlowNode } from "@xyflow/react";

/**
 * Apply offset to nodes (e.g., to position subsequent workflows below or beside previous ones)
 */
export const applyOffset = (
  nodes: xyFlowNode[],
  offsetX: number,
  offsetY: number
): xyFlowNode[] =>
  nodes.map((node) => ({
    ...node,
    position: {
      x: node.position.x + offsetX,
      y: node.position.y + offsetY,
    },
  }));

/**
 * Align subworkflow nodes vertically to the center of the parent step
 */
export const applyoffsetBasedOnLinkedNode = (
  nodes: xyFlowNode[],
  mainWorkflowNode: xyFlowNode
) => {
  const mainCenterY =
    mainWorkflowNode?.position?.y +
    mainWorkflowNode?.style.height / 2 -
    // Remove half of the subworflow node
    (NODE_HEIGHT * 0.6) / 2;
  const minSubY = Math.min(...nodes.map((n) => n.position.y));
  const offsetY = mainCenterY - minSubY;

  return applyOffset(nodes, 0, offsetY);
};
