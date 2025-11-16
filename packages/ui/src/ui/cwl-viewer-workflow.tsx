import {
  Background as B,
  BackgroundProps,
  MiniMap,
  ReactFlow,
  useReactFlow,
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

  const { fitView } = useReactFlow();

  // Reset view when workflow changes
  useEffect(() => {
    if (onChange) {
      onChange(cwlObject);
    }

    const timer = setTimeout(() => {
      fitView({ padding: 0.2, duration: 700, interpolate: "linear" });
    }, 100);

    return () => clearTimeout(timer);
  }, [cwlObject, fitView]);

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
          fitView({
            nodes: [node],
            padding: 0.002, // how tight to zoom
            duration: 700, // smooth animation
            // optional zoom limit
          });
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
