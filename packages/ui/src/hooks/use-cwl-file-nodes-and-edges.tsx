import { useEdgesState, useNodesState } from "@xyflow/react";
import { useEffect } from "react";

import { initializeEdges, initializeNodes } from "../utils";
import { useCwlFileState } from "./use-cwl-file-state";

export type UseCwlFileNodesAndEdgesProps = {
  wrappers: boolean;
  readOnly: boolean;
  labels: boolean;
  subWorkflowScalingFactor: number;
};

/**
 * Custom hook that initializes and manages the state of workflow nodes and edges.
 *
 * This hook:
 * - Generates initial nodes and edges from the current CWL workflow object.
 * - Synchronizes them when relevant workflow state changes occur with an useEffect.
 * - Provides state setters and change handlers compatible with @xyflow/react.
 *
 * @param {UseCwlFileNodesAndEdgesProps} props - Hook configuration options
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
 *   useCwlFileNodesAndEdges({ readonly: false, wrappers: true, labels: true });
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
export const useCwlFileNodesAndEdges = (
  props: UseCwlFileNodesAndEdgesProps,
) => {
  const { wrappers, readOnly, labels, subWorkflowScalingFactor } = props;

  const {
    cwlFile,
    setCwlFile,
    updateInput,
    updateStep,
    updateOutput,
    addInput,
    addStep,
    addOutput,
    colors,
    setColors,
  } = useCwlFileState();
  const initialNodes = initializeNodes({
    cwlFile,
    wrappers,
    colors,
    readOnly,
    labels,
    subWorkflowScalingFactor,
  });
  const initialEdges = initializeEdges(cwlFile, labels);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(
      initializeNodes({
        cwlFile,
        wrappers,
        colors,
        readOnly,
        labels,
        subWorkflowScalingFactor,
      }),
    );
    setEdges(initializeEdges(cwlFile, labels));
  }, [
    wrappers,
    labels,
    setEdges,
    setNodes,
    cwlFile,
    setCwlFile,
    updateInput,
    updateStep,
    updateOutput,
    addInput,
    addStep,
    addOutput,
    colors,
    setColors,
    readOnly,
    subWorkflowScalingFactor,
  ]);

  return { nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange };
};
