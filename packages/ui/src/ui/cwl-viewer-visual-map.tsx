import {
  Background as B,
  BackgroundProps,
  MiniMap,
  ReactFlow,
  useReactFlow,
  Node as xyFlowNode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import React, { ReactNode, useEffect } from "react";

import { ANIMATION_TIME } from "@theseus-cwl/configurations";
import { Input, WorkflowOutput, WorkflowStep } from "@theseus-cwl/types";

import { useCwlFileNodesAndEdges, useCwlFileState } from "../hooks";
import { CwlViewerColorEditor } from "./cwl-viewer-color-editor";

const Backgorund_ = B as React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    BackgroundProps & React.RefAttributes<Element>
  >
>;

export type CwlVisualMapProps = {
  onChange: (value: object) => void;
  setSelectedNode: (
    node: xyFlowNode<{
      label?: ReactNode;
      input?: Input;
      step?: WorkflowStep;
      output?: WorkflowOutput;
    }>,
  ) => void;
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
    onChange,
    setSelectedNode,
    wrappers,
    minimap,
    labels,
    background,
    readOnly,
    colorEditor,
    subWorkflowScalingFactor,
  } = props;

  const { cwlFile } = useCwlFileState();
  const { nodes, edges, onNodesChange, onEdgesChange } =
    useCwlFileNodesAndEdges({
      wrappers,
      readOnly,
      labels,
      subWorkflowScalingFactor,
    });
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (onChange) {
      onChange(cwlFile);
    }

    const timer = setTimeout(() => {
      fitView({
        padding: 0.2,
        duration: ANIMATION_TIME,
        interpolate: "smooth",
      });
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cwlFile, fitView, subWorkflowScalingFactor]);

  return (
    <div className="cwl-visual-map">
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
            nodeColor={(node) => node.style?.backgroundColor as string}
          />
        )}
        {background && <Backgorund_ {...background} />}
        {colorEditor && <CwlViewerColorEditor />}
      </ReactFlow>
    </div>
  );
};
