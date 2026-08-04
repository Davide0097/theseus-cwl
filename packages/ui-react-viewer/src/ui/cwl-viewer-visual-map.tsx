import {
  Background as B,
  BackgroundProps,
  MiniMap,
  ReactFlow,
  useReactFlow,
  Node as xyFlowNode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import React, { useEffect, useMemo } from "react";

import { ANIMATION_TIME } from "@theseus-cwl/configurations";

import { useCwlFileNodesAndEdges, useCwlFileState } from "../hooks";
import { CwlNodeData, cwlNodeTypes } from "./components";
import { CwlViewerColorEditor } from "./cwl-viewer-color-editor";

const Background_ = B as React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    BackgroundProps & React.RefAttributes<Element>
  >
>;

export type CwlVisualMapProps = {
  setSelectedNode: (node: xyFlowNode<CwlNodeData>) => void;
  wrappers: boolean;
  minimap: boolean;
  labels: boolean;
  readOnly: boolean;
  background: BackgroundProps;
  colorEditor: boolean;
  subWorkflowScalingFactor: number;
};

export const CwlVisualMap = (props: CwlVisualMapProps) => {
  const {
    setSelectedNode,
    wrappers,
    minimap,
    labels,
    readOnly,
    background,
    colorEditor,
    subWorkflowScalingFactor,
  } = props;

  const { cwlFile, colors } = useCwlFileState();
  const { nodes, edges, onNodesChange, onEdgesChange } =
    useCwlFileNodesAndEdges({
      wrappers,
      readOnly,
      labels,
      subWorkflowScalingFactor,
    });
  const { fitView } = useReactFlow();

  const hasNodes = useMemo(() => {
    return !!nodes.length;
  }, [nodes]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({
        padding: 0.2,
        duration: ANIMATION_TIME,
        interpolate: "smooth",
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [cwlFile, fitView, subWorkflowScalingFactor]);

  return (
    <div className="cwl-visual-map">
      {hasNodes && (
        <ReactFlow
          fitView={true}
          attributionPosition="bottom-right"
          nodeTypes={cwlNodeTypes}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          onNodeClick={(_event, node) => {
            if (node) {
              setSelectedNode(node);
              fitView({
                nodes: [node],
                padding: 0.002,
                duration: ANIMATION_TIME,
              });
            }
          }}
        >
          {minimap && (
            <MiniMap
              zoomable={true}
              pannable={true}
              nodeColor={(node) => {
                if (node.data?.input) {
                  return colors.input;
                }
                if (node.data?.step) {
                  return colors.step;
                }
                if (node.data?.output) {
                  return colors.output;
                }
                return (node.style?.background ??
                  node.style?.backgroundColor) as string;
              }}
            />
          )}
          {background && <Background_ {...background} />}
          {colorEditor && <CwlViewerColorEditor />}
        </ReactFlow>
      )}
      {!hasNodes && <p>Unable to create a valid workflow from the source</p>}
    </div>
  );
};
