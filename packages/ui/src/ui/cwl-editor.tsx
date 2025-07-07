import { useEffect, useState } from "react";
import { Node as xyFlowNode } from "@xyflow/react";

import { SingleNodeEditorComponent } from "./single-node-editor-component";
import { useColorState } from "../hooks";

import "../style.css";
import { XyflowContextProvider } from "../context";
import { WorkflowProvider } from "../context/providers/cwl-object-provider";

export type CWLFileVersion = "v1.2" | "v1.0";

/**
 *
 */
export type PrimitiveType =
  | "string"
  | "boolean"
  | "int"
  | "long"
  | "float"
  | "double"
  | "null";

/**
 *
 */
export type ComplexType = "array" | "record";

/**
 *
 */
export type SpecialType = "File" | "Directory" | "Any";

export type HasKey = {
  key: string;
};

/**
 *
 */
export type Input = {
  type: PrimitiveType | ComplexType | SpecialType;

  /**
   * A default value that can be overridden, e.g. --message "Hola mundo"
   */
  default?: string;

  /**
   * Bind this message value as an argument to "echo".
   */
  inputBinding?: {
    position: number;
  };
} & HasKey;

/** The CWL file inputs */
export type Inputs = Record<string, Input>;

/** The CWL file step */
export type Step = {
  id: string;
  content: {
    run: string;
    in: Record<string, { source: string }>;
    out: string;
  };
};

/** The CWL file steps */
export type Steps = Array<Step>;

/**
 *
 */
export type Output = {
  type: PrimitiveType | ComplexType | SpecialType;
  outputSource: string;
};

/** The CWL file outputs */
export type Outputs = Record<string, Output>;

/**
 * The main CWL file json object
 */
export interface CWLObject {
  cwlVersion: CWLFileVersion;

  /** What type of CWL process we have in this document. */
  class: "CommandLineTool" | "Workflow";

  /** This CommandLineTool executes the linux "echo" command-line tool. */
  baseCommand?: string;

  /**
   * The inputs of a tool is a list of input parameters that control how to run the tool.
   * Each parameter has an id for the name of parameter, and type describing what types of values are valid for that parameter.
   */
  inputs: Inputs;

  /**
   *
   */
  steps: Steps;

  /**
   * The outputs of a tool is a list of output parameters that should be returned after running the tool.
   * Each parameter has an id for the name of parameter, and type describing what types of values are valid for that parameter.
   */
  outputs: Outputs;
}

export class CWLWorkflow {
  cwlObject: CWLObject;
  from: "fromJSONFile" | "fromYAMLFile" | "fromObject";
  setCwlWorkflow: React.Dispatch<React.SetStateAction<CWLWorkflow | null>>;

  constructor(
    cwlObject: CWLObject,
    from: "fromJSONFile" | "fromYAMLFile" | "fromObject",
    setCwlWorkflow: React.Dispatch<React.SetStateAction<CWLWorkflow | null>>
  ) {
    this.cwlObject = cwlObject;
    this.from = from;
    this.setCwlWorkflow = setCwlWorkflow;
  }

  static fromJSONFile(
    cwlObject: CWLObject,
    setCwlWorkflow: React.Dispatch<React.SetStateAction<CWLWorkflow | null>>
  ): CWLWorkflow {
    return new CWLWorkflow(cwlObject, "fromJSONFile", setCwlWorkflow);
  }

  static fromYAMLFile(
    cwlObject: CWLObject,
    setCwlWorkflow: React.Dispatch<React.SetStateAction<CWLWorkflow | null>>
  ): CWLWorkflow {
    return new CWLWorkflow(cwlObject, "fromYAMLFile", setCwlWorkflow);
  }

  static fromObject(
    cwlObject: CWLObject,
    setCwlWorkflow: React.Dispatch<React.SetStateAction<CWLWorkflow | null>>
  ): CWLWorkflow {
    return new CWLWorkflow(cwlObject, "fromObject", setCwlWorkflow);
  }

  addInput() {
    this.cwlObject.inputs["zip_fileww"] = { type: "string" };
  }

  addStepNode() {
    this.cwlObject.steps.push({
      id: "unta2r",
      content: {
        run: "../tar/tar.cwl",
        in: {
          compress_file: { source: "zip_file2" },
        },
        out: "uncompress_file",
      },
    });
  }

  addOutput() {
    this.cwlObject.outputs["empty_output"] = {
      outputSource: "grep",
      type: "string",
    };
  }

  editInput(
    id: string,
    updatedData: {
      id: string;
      type?: Inputs[string]["type"];
      default?: string;
      inputBinding?: { position: number };
    },
    setCwlWorkflow: () => void
  ): boolean {
    const input = this.cwlObject.inputs[id];

    if (!input) {
      console.warn(`Input "${id}" not found.`);
      return false;
    }

    const newId = updatedData.id;

    if (newId !== id) {
      if (this.cwlObject.inputs[newId]) {
        console.warn(`Input "${newId}" already exists. Cannot rename.`);
        return false;
      }

      this.cwlObject.inputs[newId] = { ...input };
      delete this.cwlObject.inputs[id];
    }

    const targetInput = this.cwlObject.inputs[newId];

    if (updatedData.type !== undefined) {
      targetInput!.type = updatedData.type;
    }

    if (updatedData.default !== undefined) {
      targetInput!.default = updatedData.default;
    }

    if (updatedData.inputBinding !== undefined) {
      targetInput!.inputBinding = updatedData.inputBinding;
    }

    this.cwlObject.inputs = { ...this.cwlObject.inputs };

    // ✅ Force re-render through callback

    this.renderView();

    return true;
  }
  renderView() {
    this.setCwlWorkflow(
      new CWLWorkflow({ ...this.cwlObject }, this.from, this.setCwlWorkflow)
    );
  }
  deleteInput() {}
}

/**
 *
 */
export type CwlEditorProps = {
  input: CWLObject | undefined | Array<CWLObject>;
  onChange: (value: object) => void;
  readonly?: boolean;
  wrappers?: boolean;
  minimap?: boolean;
  preview?: boolean;
};

/**
 *
 */
export const CwlEditor = (props: CwlEditorProps) => {
  const { input, onChange, readonly, wrappers, minimap, preview } = props;
  const [selectedNode, setSelectedNode] = useState<xyFlowNode | null>(null);
  const [colors] = useColorState();

  // Initialize CWLWorkflow when `input` changes
  const object = Array.isArray(input) ? input[0]! : input;

  return (
    <>
      <WorkflowProvider initialCwlObject={object}>
        {preview && object ? (
          <div className="cwl-editor-preview">
            <XyflowContextProvider
              colors={colors}
              readonly={true}
              onChange={onChange}
              setSelectedNode={setSelectedNode}
              minimap={false}
              wrappers={false}
            />
          </div>
        ) : (
          <div className="cwl-editor">
            <div className="cwl-editor-flow-editor">
              <XyflowContextProvider
                colors={colors}
                minimap={minimap}
                readonly={readonly}
                onChange={onChange}
                setSelectedNode={setSelectedNode}
                wrappers={wrappers}
              />
            </div>
            <SingleNodeEditorComponent node={selectedNode} />
          </div>
        )}
      </WorkflowProvider>
    </>
  );
};
