import { useEdgesState, useNodesState } from "@xyflow/react";
import { useEffect } from "react";

import { initializeEdges, initializeNodes } from "../utils";
import { useWorkflowState } from "./use-workflow-state";

export type UseWorkflowNodesAndEdgesProps = {
  wrappers: boolean;
  readOnly: boolean;
  labels: boolean;
};

/**
 * Custom hook that initializes and manages the state of workflow nodes and edges.
 *
 * This hook:
 * - Generates initial nodes and edges from the current CWL workflow object.
 * - Synchronizes them when relevant workflow state changes occur with an useEffect.
 * - Provides state setters and change handlers compatible with @xyflow/react.
 *
 * @param props - Hook configuration options
 * @param props.wrappers - If `true`, includes wrapper nodes in the generated node sets
 *
 * @returns Object containing:
 * - `nodes`: Current workflow nodes
 * - `setNodes`: State setter for nodes
 * - `onNodesChange`: Change handler for nodes (compatible with @xyflow/react)
 * - `edges`: Current workflow edges (compatible with @xyflow/react)
 * - `setEdges`: State setter for edges (compatible with @xyflow/react)
 * - `onEdgesChange`: Change handler for edges (compatible with @xyflow/react)
 *
 * @example
 * ```tsx
 * const { nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange } =
 *   useWorkflowNodesAndEdges({ readonly: false, wrappers: true });
 *
 * return (
 *   <ReactFlow
 *     nodes={nodes}
 *     onNodesChange={onNodesChange}
 *     edges={edges}
 *     onEdgesChange={onEdgesChange}
 *   />
 * );
 * ```
 *
 * NOTE: This package is intended to be a 'viewer' and not an 'editor'.
 * Editing behaviors are used internally as a possible evolution of the project.
 * They must not be considered part of the public API.
 */
export const useWorkflowNodesAndEdges = (
  props: UseWorkflowNodesAndEdgesProps
) => {
  const { wrappers, readOnly, labels } = props;

  const {
    cwlObject,
    setCwlObject,
    updateInput,
    updateStep,
    updateOutput,
    addInput,
    addStep,
    addOutput,
    colors,
    setColors,
  } = useWorkflowState();

  const initialNodes = initializeNodes({
           cwlFile:cwlObject,

    wrappers,
    colors,
    readOnly,
    labels,
  });
  const initialEdges = initializeEdges(cwlObject, labels);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(
      initializeNodes({
        cwlFile:cwlObject,
        wrappers,
        colors,
        readOnly,
        labels,
      })
    );
    setEdges(initializeEdges(cwlObject, labels));

    console.log(nodes, edges)
  }, [
    wrappers,
    labels,
    setEdges,
    setNodes,
    cwlObject,
    setCwlObject,
    updateInput,
    updateStep,
    updateOutput,
    addInput,
    addStep,
    addOutput,
    colors,
    setColors,
    readOnly,
  ]);

  return { nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange };
};
