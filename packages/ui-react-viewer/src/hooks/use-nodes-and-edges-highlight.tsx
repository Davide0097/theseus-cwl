import { Edge, Node as xyFlowNode } from "@xyflow/react";
import { MouseEvent, useCallback, useMemo, useState } from "react";

import { CwlNodeData, CwlNodeType } from "../ui";
import { applyHighlight } from "../utils";

export type UseNodesAndEdgesHighlightProps = {
  /** The graph nodes to decorate. */
  nodes: xyFlowNode<CwlNodeData>[];

  /** The graph edges to decorate. */
  edges: Edge[];

  /** When false the hook is inert and returns the inputs untouched. */
  enabled: boolean;
};

/**
 * Custom hook that manages the hover/selection highlight of the graph.
 *
 * This hook:
 * - Tracks the currently hovered node and edge.
 * - Derives the selected node from the xyflow `selected` flag.
 * - Decorates nodes/edges via `applyHighlight` so the hovered edge — or the
 *   connections of the hovered node, or, when nothing is hovered, of the
 *   selected node — stand out while unrelated elements are dimmed.
 * - Exposes `activeNodeIds` (the highlighted node/edge endpoints) so the
 *   minimap can tint them in sync.
 *
 * @param {UseNodeHighlightProps} props - Hook configuration options
 *
 * @returns Object containing:
 * - `nodes`: Nodes to render (decorated when a highlight is active)
 * - `edges`: Edges to render (decorated when a highlight is active)
 * - `activeNodeIds`: Ids of the highlighted node (or hovered-edge endpoints)
 * - `onNodeMouseEnter`: Handler for ReactFlow's `onNodeMouseEnter`
 * - `onNodeMouseLeave`: Handler for ReactFlow's `onNodeMouseLeave`
 * - `onEdgeMouseEnter`: Handler for ReactFlow's `onEdgeMouseEnter`
 * - `onEdgeMouseLeave`: Handler for ReactFlow's `onEdgeMouseLeave`
 *
 * @example
 * ```tsx
 * const highlight = useNodesAndEdgesHighlight({ nodes, edges, enabled: highlights });
 *
 * return (
 *   <ReactFlow
 *     nodes={highlight.nodes}
 *     edges={highlight.edges}
 *     onNodeMouseEnter={highlight.onNodeMouseEnter}
 *     onNodeMouseLeave={highlight.onNodeMouseLeave}
 *   />
 * );
 * ```
 */
export const useNodesAndEdgesHighlight = (
  props: UseNodesAndEdgesHighlightProps,
) => {
  const { nodes, edges, enabled } = props;

  const [hoveredNodeId, setHoveredNodeId] = useState<string | undefined>(
    undefined,
  );
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | undefined>(
    undefined,
  );

  const selectedNodeId = useMemo(() => {
    return nodes.find(
      (node) => node.selected && node.type !== CwlNodeType.WRAPPER,
    )?.id;
  }, [nodes]);

  const activeEdgeId = enabled ? hoveredEdgeId : undefined;
  const activeNodeId =
    enabled && !activeEdgeId ? (hoveredNodeId ?? selectedNodeId) : undefined;

  const { nodes: displayNodes, edges: displayEdges } = useMemo(() => {
    return applyHighlight({ nodes, edges, activeNodeId, activeEdgeId });
  }, [nodes, edges, activeNodeId, activeEdgeId]);

  const activeNodeIds = useMemo(() => {
    const ids = new Set<string>();

    if (activeEdgeId) {
      const activeEdge = edges.find((edge) => edge.id === activeEdgeId);
      if (activeEdge) {
        ids.add(activeEdge.source);
        ids.add(activeEdge.target);
      }
    } else if (activeNodeId) {
      ids.add(activeNodeId);
    }

    return ids;
  }, [edges, activeNodeId, activeEdgeId]);

  const onNodeMouseEnter = useCallback(
    (event: MouseEvent, node: xyFlowNode<CwlNodeData>) => {
      if (node.type !== CwlNodeType.WRAPPER) {
        setHoveredNodeId(node.id);
      }
    },
    [],
  );

  const onNodeMouseLeave = useCallback(() => {
    setHoveredNodeId(undefined);
  }, []);

  const onEdgeMouseEnter = useCallback((event: MouseEvent, edge: Edge) => {
    setHoveredEdgeId(edge.id);
  }, []);

  const onEdgeMouseLeave = useCallback(() => {
    setHoveredEdgeId(undefined);
  }, []);

  return {
    nodes: displayNodes,
    edges: displayEdges,
    activeNodeIds,
    onNodeMouseEnter,
    onNodeMouseLeave,
    onEdgeMouseEnter,
    onEdgeMouseLeave,
  };
};
