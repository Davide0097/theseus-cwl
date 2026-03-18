import {
  BackgroundProps,
  BackgroundVariant,
  Node as xyFlowNode,
} from "@xyflow/react";
import { ReactNode, useEffect, useState } from "react";

import { SUBWORKFLOW_NODE_SCALING_FACTOR } from "@theseus-cwl/configurations";
import { CWLSourceHolder } from "@theseus-cwl/parser";
import {
  CwlSource,
  Input,
  Shape,
  WorkflowOutput,
  WorkflowStep,
} from "@theseus-cwl/types";

import { CwlFileProvider, XyflowContextProvider } from "../context";
import { ColorState } from "../hooks";
import { CwlViewerNodeInspector } from "./cwl-viewer-node-inspector";

import "../style.css";

/**
 * Props for the CwlViewer component.
 */
export type CwlViewerProps = {
  /** CWL source to be loaded into the viewer */
  input?: CwlSource<Shape.Raw>;

  /** Callback triggered when the cwl file changes, default is a function that logs in the console the changes */
  onChange?: (value: object) => void;

  /** If true, enables wrapper nodes in the graph view, default is false */
  wrappers?: boolean;

  /** If true, shows a minimap in the viewer, default is false */
  minimap?: boolean;

  /** If true, shows a label for each edge, default is false */
  labels?: boolean;

  /** If true, shows the color selector panel, default is false */
  colorEditor?: boolean;

  /** Initial color configuration for node types */
  initialColorState?: ColorState;

  /** The workflow background configuration */
  background?: Pick<
    BackgroundProps,
    "variant" | "color" | "bgColor" | "style" | "gap" | "size"
  >;

  /** Set the scaling factor for subworkflows, default is 0.8 */
  subWorkflowScalingFactor?: number;
};

export const CwlViewer = (props: CwlViewerProps) => {
  const {
    input = undefined,
    onChange = (changed) => console.log(changed),
    wrappers = false,
    minimap = false,
    labels = false,
    colorEditor = false,
    initialColorState = undefined,
    background = { color: "transparent", variant: BackgroundVariant.Dots },
    subWorkflowScalingFactor = SUBWORKFLOW_NODE_SCALING_FACTOR,
  } = props;

  /**
   * NOTE: This package is intended to be a 'viewer' and not an 'editor'.
   * Editing behaviors are used internally as a possible evolution of the project.
   * They must not be considered part of the public API.
   */
  const readOnly = true;

  const [selectedNode, setSelectedNode] = useState<
    | xyFlowNode<{
        label?: ReactNode;
        input?: Input;
        step?: WorkflowStep;
        output?: WorkflowOutput;
      }>
    | undefined
  >(undefined);
  const [sourceHolder, setSourceHolder] = useState<CWLSourceHolder | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    setLoading(true);

    if (!input) {
      setSourceHolder(undefined);
      setSelectedNode(undefined);
      setError("Input not provided");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const holder = await CWLSourceHolder.create(input);
        setSourceHolder(holder);
        setSelectedNode(undefined);
        setError(undefined);
      } catch (err: unknown) {
        setSourceHolder(undefined);
        setSelectedNode(undefined);

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unexpected error while loading workflow");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [input]);

  if (loading) {
    return <div className="cwl-viewer-loading">Loading workflow...</div>;
  }

  if (error) {
    return (
      <div className="cwl-viewer-error">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (!sourceHolder) {
    return <div className="cwl-viewer-empty">No workflow loaded</div>;
  }

  return (
    <CwlFileProvider
      initialCwlFile={sourceHolder.activeFile}
      initialColorState={initialColorState}
    >
      <div className="cwl-viewer">
        <XyflowContextProvider
          minimap={minimap}
          labels={labels}
          onChange={onChange}
          setSelectedNode={setSelectedNode}
          wrappers={wrappers}
          readOnly={readOnly}
          background={background}
          colorEditor={colorEditor}
          subWorkflowScalingFactor={subWorkflowScalingFactor}
        />
        {selectedNode && (
          <CwlViewerNodeInspector
            readOnly={readOnly}
            nodeProps={selectedNode.data}
          />
        )}
      </div>
    </CwlFileProvider>
  );
};
