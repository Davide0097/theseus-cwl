import { Node as xyflowNode } from "@xyflow/react";

import { NODE_HEIGHT } from "@theseus-cwl/configurations";

/** Calculates the maximum bottom Y position among all nodes, the position corresponds to the bottom-(left/right) corner y coordinate of the node **/
export const getMaxBottom = (nodes: xyflowNode[]): number => {
  return nodes.length === 0
    ? 0
    : Math.max(...nodes.map((node) => node.position.y + NODE_HEIGHT));
};
