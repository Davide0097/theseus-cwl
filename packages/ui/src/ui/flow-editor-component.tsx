import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  Node as xyFlowNode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { createContext, useContext, useState } from "react";

import { useWorkflow, useWorkflowActions } from "../hooks";
import { useWorkflowNodesAndEdges } from "../hooks/use-workflow-nodes-and-edges";
import { CWLWorkflow } from "./cwl-editor";

/**
 *
 */
export type EditorComponentProps = {
  colors: any;
  onChange: (value: object) => void;
  setSelectedNode: (node: xyFlowNode) => void;

  readonly?: boolean;
  wrappers?: boolean;
  minimap?: boolean;
};

/**
 *
 */
export const FlowEditorComponent = (props: EditorComponentProps) => {
  const {
    colors,
    setSelectedNode,

    readonly = true,
    wrappers = true,
    minimap = true,
  } = props;

  const { fitView } = useReactFlow();

  const { nodes, edges, onNodesChange, onEdgesChange } =
    useWorkflowNodesAndEdges({
      colors,
      wrappers,
    });

  return (
    <ReactFlow
      fitView
      attributionPosition="top-right"
      nodes={nodes}
      edges={edges}
      nodesDraggable={!readonly}
      nodesConnectable={!readonly}
      elementsSelectable={!readonly}
      onNodesChange={readonly ? undefined : onNodesChange}
      onEdgesChange={readonly ? undefined : onEdgesChange}
      // onNodesDelete={readonly ? undefined : onDeleteNode}
      onNodeClick={(_event, node) => {
        setSelectedNode(node);
      }}
    >
      <Controls />
      {minimap && (
        <MiniMap
          zoomable
          pannable
          nodeColor={(node) => node.style?.backgroundColor as string}
        />
      )}
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
    </ReactFlow>
  );
};
