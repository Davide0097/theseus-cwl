import {
  BackgroundProps,
  BackgroundVariant,
  Node as xyFlowNode,
} from "@xyflow/react";
import { useEffect, useState } from "react";

import { CWLObject } from "@theseus-cwl/types";

import { WorkflowProvider, XyflowContextProvider } from "../context";
import { ColorState } from "../hooks";
import { CwlViewerNodeInspector } from "./cwl-viewer-node-inspector";

import "../style.css";

export class CWLWorkflow {
  cwlObject: CWLObject;
  from: "YAML" | "JSON" | "STRING";

  constructor(cwlObject: CWLObject, from: "YAML" | "JSON" | "STRING") {
    this.cwlObject = cwlObject;
    this.from = from;
  }

  // static fromYAMLFile(file: File): CWLWorkflow {
  //   return new CWLWorkflow(file, "YAML");
  // }

  static fromObject(cwlObject: CWLObject): CWLWorkflow {
    return new CWLWorkflow(cwlObject, "JSON");
  }

  static fromString(cwlObject: string): CWLWorkflow {
    return new CWLWorkflow(JSON.parse(cwlObject), "STRING");
  }
}

/**
 * Props for the CwlViewer component.
 */
export type CwlViewerProps = {
  /** CWL object or File to be loaded into the viewer */
  input: string | CWLObject | File | undefined;

  /** Callback triggered when the cwl workflow changes, default is a function that logs in the console the changes */
  onChange?: (value: object) => void;

  /** If true, enables wrapper nodes in the graph view, default is false  */
  wrappers?: boolean;

  /** If true, shows a minimap in the viewer, default is false  */
  minimap?: boolean;

  /** If true, shows a label for each edge, default is false  */
  labels?: boolean;

  /** If true, shows the color selector panel, default is false  */
  colorEditor?: boolean;

  /** Initial color configuration for node types */
  initialColorState?: ColorState;

  /** The workflow background configuration */
  background?: Pick<
    BackgroundProps,
    "variant" | "color" | "bgColor" | "style" | "gap" | "size"
  >;
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
  } = props;

  /**
   * For future implementations
   */
  const readOnly = true;

  const [selectedNode, setSelectedNode] = useState<xyFlowNode | undefined>(
    undefined
  );
  const [cwlWorkflow, setCwlWorkflow] = useState<CWLWorkflow | undefined>(
    undefined
  );

  useEffect(() => {
    if (!input) {
      setCwlWorkflow(undefined);
      return;
    }
    if (typeof input === "string") {
      setCwlWorkflow(CWLWorkflow.fromString(input));
    } 
    else if (input instanceof File) {
      // setCwlWorkflow(CWLWorkflow.fromYAMLFile(input));
    } 
    else {
      setCwlWorkflow(CWLWorkflow.fromObject(input));
    }
  }, [input]);

  if (!cwlWorkflow) {
    return null;
  }

  return (
    <WorkflowProvider
      initialCwlObject={cwlWorkflow.cwlObject}
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
        />
        {selectedNode && (
          <CwlViewerNodeInspector
            readOnly={readOnly}
            nodeProps={
              (selectedNode?.data?.label as Record<string, never> | undefined)
                ?.props
            }
          />
        )}
      </div>
    </WorkflowProvider>
  );
};
