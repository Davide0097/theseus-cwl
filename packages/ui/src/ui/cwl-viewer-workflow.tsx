import {
  Background as B,
  BackgroundProps,
  MiniMap,
  ReactFlow,
  Node as xyFlowNode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect } from "react";

import { useWorkflowNodesAndEdges, useWorkflowState } from "../hooks";
import { CwkViewerColorEditor } from "./cwl-viewer-color-editor";

const Backgorund_ = B as React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    BackgroundProps & React.RefAttributes<Element>
  >
>;

export type CwlViewerWorkflowProps = {
  onChange: (value: object) => void;
  setSelectedNode: (node: xyFlowNode) => void;
  wrappers: boolean;
  minimap: boolean;
  labels: boolean;
  readOnly: boolean;
  background: BackgroundProps;
  colorEditor: boolean;
};

export const CwlViewerWorkflow = (props: CwlViewerWorkflowProps) => {
  const {
    onChange,
    setSelectedNode,
    wrappers,
    minimap,
    labels,
    background,
    readOnly,
    colorEditor,
  } = props;

  const { cwlObject } = useWorkflowState();
  const { nodes, edges, onNodesChange, onEdgesChange } =
    useWorkflowNodesAndEdges({
      wrappers,
      readOnly,
      labels,
    });

  useEffect(() => {
    if (onChange) {
      onChange(cwlObject);
    }
  }, [cwlObject, onChange, props]);

  return (
    <div className="cwl-viewer-workfow">
      <ReactFlow
        fitView={true}
        attributionPosition="bottom-right"
        nodes={nodes}
        edges={edges}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
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
        {background && <Backgorund_ {...background} />}
        {colorEditor && <CwkViewerColorEditor />}
      </ReactFlow>
    </div>
  );
};
