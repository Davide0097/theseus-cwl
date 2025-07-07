import { useEdgesState, useNodesState } from "@xyflow/react";
import { useEffect } from "react";

import { initializeEdges, initializeNodes } from "../utils";
import { useWorkflow } from "./use-workflow-state";

export type UseWorkflowNodesAndEdgesProps = {
  colors: Record<string, string>;
  wrappers: boolean;
};

export const useWorkflowNodesAndEdges = (
  props: UseWorkflowNodesAndEdgesProps
) => {
  const { colors, wrappers } = props;
  const { cwlObject, addInput, addOutput, addStep } = useWorkflow();

  const initialNodes = initializeNodes(
    cwlObject,
    addInput,
    addStep,
    addOutput,
    colors,
    wrappers
  );
  const initialEdges = initializeEdges(cwlObject);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(
      initializeNodes(cwlObject, addInput, addStep, addOutput, colors, wrappers)
    );
    setEdges(initializeEdges(cwlObject));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cwlObject, colors, wrappers]);

  return { nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange };
};
