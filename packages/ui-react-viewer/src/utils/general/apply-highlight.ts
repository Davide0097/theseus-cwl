import { Edge, Node as xyFlowNode } from "@xyflow/react";

import { CwlNodeData, CwlNodeType } from "../../ui";

export type ApplyHighlightProps = {
  /** All graph nodes. */
  nodes: xyFlowNode<CwlNodeData>[];

  /** All graph edges. */
  edges: Edge[];

  /** Id of the hovered/selected node driving the highlight, if any. */
  activeNodeId: string | undefined;

  /**
   * Id of the hovered edge driving the highlight, if any.
   * Takes precedence over `activeNodeId`.
   */
  activeEdgeId?: string | undefined;
};

export type ApplyHighlightResult = {
  nodes: xyFlowNode<CwlNodeData>[];
  edges: Edge[];
};

/**
 * Decorates nodes and edges so the data flow around the active element stands
 * out: edges touching the active node (or the hovered edge itself, which also
 * reveals its label) switch to the highlight stroke/marker color and get a
 * thicker stroke, while every unrelated node and edge receives a dimming
 * class (`cwl-node-dimmed` / `cwl-edge-dimmed`, styled in `style.css`).
 * Wrapper (group) nodes are never dimmed. Returns the inputs untouched when
 * there is no active node or edge.
 */
export const applyHighlight = (
  props: ApplyHighlightProps,
): ApplyHighlightResult => {
  const { nodes, edges, activeNodeId, activeEdgeId } = props;

  if (!activeNodeId && !activeEdgeId) {
    return { nodes, edges };
  }

  const connectedNodeIds = new Set<string>();
  if (activeNodeId) {
    connectedNodeIds.add(activeNodeId);
  }

  const highlightedEdges = edges.map((edge) => {
    const isConnected = activeEdgeId
      ? edge.id === activeEdgeId
      : edge.source === activeNodeId || edge.target === activeNodeId;

    if (!isConnected) {
      return { ...edge, className: "cwl-edge-dimmed" };
    }

    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);

    return {
      ...edge,
      label: activeEdgeId
        ? (edge.label ?? `${edge.source} → ${edge.target}`)
        : edge.label,
      style: {
        ...edge.style,
        stroke: "var(--cwl-viewer-edge-highlight-color)",
        strokeWidth: Number(edge.style?.strokeWidth ?? 1) * 1.5,
      },
      markerEnd:
        typeof edge.markerEnd === "object"
          ? {
              ...edge.markerEnd,
              color: "var(--cwl-viewer-edge-highlight-color)",
            }
          : edge.markerEnd,
      zIndex: 1,
    };
  });

  const highlightedNodes = nodes.map((node) =>
    node.type === CwlNodeType.WRAPPER || connectedNodeIds.has(node.id)
      ? node
      : { ...node, className: "cwl-node-dimmed" },
  );

  return { nodes: highlightedNodes, edges: highlightedEdges };
};
