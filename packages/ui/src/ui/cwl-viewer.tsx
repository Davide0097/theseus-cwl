import {
  BackgroundProps,
  BackgroundVariant,
  Node as xyFlowNode,
} from "@xyflow/react";
import { ReactNode, useEffect, useState } from "react";

import { SUBWORKFLOW_NODE_SCALING_FACTOR } from "@theseus-cwl/configurations";
import {
  CWLPackedDocument,
  Input,
  Shape,
  Workflow,
  WorkflowOutput,
  WorkflowStep,
} from "@theseus-cwl/types";

import { CwlFileProvider, XyflowContextProvider } from "../context";
import { ColorState } from "../hooks";
import "../style.css";
import { isPackedDocument, normalizeInput, normalizeStepsIn } from "../utils";
import { CwlViewerNodeInspector } from "./cwl-viewer-node-inspector";

export class CWLWorkflow {
  cwlFile: Workflow | CWLPackedDocument;
  from: "YAML" | "JSON" | "STRING";

  private constructor(
    cwlFile: Workflow | CWLPackedDocument,
    from: "YAML" | "JSON" | "STRING",
  ) {
    this.cwlFile = cwlFile;
    this.from = from;
  }

  static async create(
    input: string | Workflow<Shape.Raw> | CWLPackedDocument<Shape.Raw> | File,
  ): Promise<CWLWorkflow> {
    if (typeof input === "string") {
      return new CWLWorkflow(this.sanitize(JSON.parse(input)), "STRING");
    }

    if (input instanceof File) {
      const text = await input.text();
      return new CWLWorkflow(this.sanitize(JSON.parse(text)), "YAML");
    }

    if (isPackedDocument(input)) {
      return new CWLWorkflow(this.sanitize(input), "JSON");
    }

    return new CWLWorkflow(this.sanitize(input), "JSON");
  }

  private static sanitize(
    obj: Workflow<Shape.Raw> | CWLPackedDocument<Shape.Raw>,
  ): Workflow | CWLPackedDocument {
    let sanitizedObj: Workflow | CWLPackedDocument;

    if (isPackedDocument(obj)) {
      const newGraph: Record<string, Workflow> = {};
      for (const [key, wf] of Object.entries(obj.$graph)) {
        newGraph[key] = { ...this.sanitizeWorkflow(wf), id: key } as Workflow;
      }
      sanitizedObj = { ...obj, $graph: newGraph } as CWLPackedDocument;
      return sanitizedObj;
    } else {
      return this.sanitizeWorkflow(obj);
    }
  }

  /** Recursively assign IDs to workflow, inputs, steps, and outputs */
  private static sanitizeWorkflow(wf: Workflow<Shape.Raw>): Workflow {
    const newInputs: Record<string, Input> = {};
    if (wf.inputs) {
      for (const [key, input] of Object.entries(wf.inputs)) {
        if (typeof input === "string") {
          newInputs[key] = { ...normalizeInput(input), id: key };
        } else {
          newInputs[key] = { ...input, id: key };
        }
      }
    }

    const newSteps: Record<string, WorkflowStep> = {};
    if (wf.steps) {
      for (const [key, step] of Object.entries(wf.steps)) {
        newSteps[key] = {
          ...step,
          in: normalizeStepsIn(step.in),
          id: key,
        } as WorkflowStep;
      }
    }

    const newOutputs: Record<string, WorkflowOutput> = {};
    if (wf.outputs) {
      for (const [key, output] of Object.entries(wf.outputs)) {
        newOutputs[key] = { ...output, id: key };
      }
    }

    return {
      ...wf,
      id: "Worflow",
      inputs: newInputs,
      steps: newSteps,
      outputs: newOutputs,
    };
  }
}

/**
 * Props for the CwlViewer component.
 */
export type CwlViewerProps = {
  /** CWL object or File to be loaded into the viewer */
  input:
    | string
    | Workflow<Shape.Raw>
    | CWLPackedDocument<Shape.Raw>
    | File
    | undefined;

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
  const [cwlWorkflow, setCwlWorkflow] = useState<CWLWorkflow | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!input) {
      setCwlWorkflow(undefined);
      return;
    } else {
      (async () => {
        const workflow = await CWLWorkflow.create(input);
        setCwlWorkflow(workflow);
      })();
    }
  }, [input]);

  if (!cwlWorkflow) {
    return null;
  }

  return (
    <CwlFileProvider
      initialCwlFile={cwlWorkflow.cwlFile}
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
