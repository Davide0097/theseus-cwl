import { useEdgesState, useNodesState } from "@xyflow/react";
import { useEffect } from "react";

import { initializeEdges, initializeNodes } from "../utils";
import { useWorkflow } from "./use-workflow-state";

export type UseWorkflowNodesAndEdgesProps = {
  readonly: boolean;
  wrappers: boolean;
};

export const useWorkflowNodesAndEdges = (
  props: UseWorkflowNodesAndEdgesProps
) => {
  const { wrappers, readonly } = props;

  const { cwlObject, addInput, addOutput, addStep } = useWorkflow();

  const initialNodes = initializeNodes({
    cwlObject,
    readonly,
    wrappers,
  });
  const initialEdges = initializeEdges(cwlObject);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(
      initializeNodes({
        cwlObject,
        readonly,
        wrappers,
      })
    );
    setEdges(initializeEdges(cwlObject));
  }, [
    cwlObject,
    readonly,
    wrappers,
    setNodes,
    addInput,
    addStep,
    addOutput,
    setEdges,
  ]);

  return { nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange };
};
