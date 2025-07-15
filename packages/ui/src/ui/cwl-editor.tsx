import { Node as xyFlowNode } from "@xyflow/react";
import { useEffect, useState } from "react";

import type { CWLObject } from "@theseus-cwl/types";
import { WorkflowProvider, XyflowContextProvider } from "../context";
import { SingleNodeEditorComponent } from "./single-node-editor-component";
import { useWorkflow } from "../hooks";

import "../style.css";

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
}

export type CwlEditorProps = {
  input: CWLObject | undefined | Array<CWLObject>;
  onChange: (value: object) => void;
  readonly: boolean;
  wrappers: boolean;
  minimap: boolean;
  preview: boolean;
};

export const CwlEditor = (props: CwlEditorProps) => {
  const { input, onChange, readonly, wrappers, minimap, preview } = props;
  const [selectedNode, setSelectedNode] = useState<xyFlowNode | null>(null);

  // Initialize CWLWorkflow when `input` changes
  const object = Array.isArray(input) ? input[0]! : input;

  return (
    <>
      <WorkflowProvider initialCwlObject={object!}>
        {preview && object ? (
          <div className="cwl-editor-preview">
            <XyflowContextProvider
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
                minimap={minimap}
                readonly={readonly}
                onChange={onChange}
                setSelectedNode={setSelectedNode}
                wrappers={wrappers}
              />
            </div>
            <CwkWorkflowLegendEditor />
            <SingleNodeEditorComponent node={selectedNode} />
          </div>
        )}
      </WorkflowProvider>
    </>
  );
};

type LegendEditorProps = {};

export const CwkWorkflowLegendEditor = ({}: LegendEditorProps) => {
  const { colors, setColorForType, resetColors } = useWorkflow();

  // Local state
  const [localColors, setLocalColors] = useState(colors);

  // Sync local state when global colors change
  useEffect(() => {
    setLocalColors(colors);
  }, [colors]);

  const handleLocalColorChange = (type: keyof typeof colors, value: string) => {
    setLocalColors((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const applyColors = () => {
    Object.entries(localColors).forEach(([type, value]) => {
      setColorForType(type as keyof typeof colors, value);
    });
  };

  const handleReset = () => {
    resetColors(); // Reset global
    setLocalColors(colors); // Reset local (will also sync via useEffect)
  };

  return (
    <div
      style={{
        position: "absolute",
        color: "black",
        bottom: "0",
        right: "500px",
        width: "200px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {(["input", "output", "steps", "default"] as const).map((type) => (
        <div key={type}>
          <label>
            {type.charAt(0).toUpperCase() + type.slice(1)} Node Color:
          </label>
          <input
            type="color"
            value={localColors[type]}
            onChange={(e) => handleLocalColorChange(type, e.target.value)}
          />
        </div>
      ))}
      <button onClick={applyColors}>Apply</button>
      <button onClick={handleReset}>Reset</button>
    </div>
  );
};
