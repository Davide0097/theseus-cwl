import {
  // Background,
  // BackgroundVariant,
  // Controls,
  MiniMap,
  ReactFlow,
  // useReactFlow,
  Node as xyFlowNode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useWorkflowNodesAndEdges } from "../hooks";

export type EditorComponentProps = {
  onChange: (value: object) => void;
  setSelectedNode: (node: xyFlowNode) => void;
  readonly: boolean;
  wrappers: boolean;
  minimap: boolean;
};

export const FlowEditorComponent = (props: EditorComponentProps) => {
  const { setSelectedNode, readonly, wrappers, minimap } = props;

  // const { fitView } = useReactFlow();

  const { nodes, edges, onNodesChange, onEdgesChange } =
    useWorkflowNodesAndEdges({
      wrappers,
      readonly,
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
      onNodeClick={(_event, node) => {
        setSelectedNode(node);
      }}
    >
      {/* <Controls /> */}

      {minimap && (
        <MiniMap
          zoomable
          pannable
          nodeColor={(node) => node.style?.backgroundColor as string}
        />
      )}
      {/* <Background variant={BackgroundVariant.Dots} gap={12} size={1} /> */}
    </ReactFlow>
  );
};
