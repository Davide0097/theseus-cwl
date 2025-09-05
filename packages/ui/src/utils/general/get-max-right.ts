import { Node as xyflowNode } from "@xyflow/react";

import { NODE_WIDTH } from "@theseus-cwl/configurations";

/** Calculates the maximum right X position among all nodes, the position corresponds to the (top/bottom)-right corner x coordinate of the node **/
export const getMaxRight = (nodes: xyflowNode[]): number => {
  return nodes.length === 0
    ? 0
    : Math.max(...nodes.map((node) => node.position.x + NODE_WIDTH));
};
