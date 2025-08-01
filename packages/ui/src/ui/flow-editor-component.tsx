import {
  Background,
   BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  Node as xyFlowNode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useWorkflow, useWorkflowNodesAndEdges } from "../hooks";
import { memo, useEffect } from "react";

 

export type EditorComponentProps = {
  onChange: (value: object) => void;
  setSelectedNode: (node: xyFlowNode) => void;
  readonly: boolean;
  wrappers: boolean;
  minimap: boolean;
};
 
export const FlowEditorComponent = (props: EditorComponentProps) => {
  const { setSelectedNode, readonly, wrappers, minimap } = props;
  const { cwlObject } = useWorkflow();
  const { nodes, edges, onNodesChange, onEdgesChange } =
    useWorkflowNodesAndEdges({
      wrappers,
      readonly,
    });

  useEffect(() => {
    props.onChange(cwlObject);
  }, [cwlObject, props]);

  return (
    <div style={{ height: "100vh" }}>
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
        {minimap && (
          <MiniMap
            zoomable
            pannable
            nodeColor={(node) => node.style?.backgroundColor as string}
          />
        )}
         {/* <Controls />   */}
        {/* <Background
          id="1"
          gap={10}
          color="#f1f1f1"
          variant={BackgroundVariant.Lines}
        />
        <Background
          id="2"
          gap={100}
          color="#ccc"
          variant={BackgroundVariant.Lines}
        /> */}
      </ReactFlow>
    </div>
  );
};
