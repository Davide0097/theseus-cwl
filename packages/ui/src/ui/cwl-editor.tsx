import { Node as xyFlowNode } from "@xyflow/react";
import { useEffect, useState } from "react";

import { WorkflowProvider, XyflowContextProvider } from "../context";
import { SingleNodeEditorComponent } from "./single-node-editor-component";
import { useWorkflow } from "../hooks";

import "../style.css";
import { CWLObject } from "@theseus-cwl/types";

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
  colorSelector: boolean;
};

export const CwlEditor = (props: CwlEditorProps) => {
  const {
    input = undefined,
    onChange = (changes) => console.log(changes),
    readonly = false,
    wrappers = false,
    minimap = false,
    preview = false,
    colorSelector = false,
  } = props;
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
            {colorSelector && <CwkWorkflowLegendEditor />}
            <SingleNodeEditorComponent node={selectedNode} />
          </div>
        )}
      </WorkflowProvider>
    </>
  );
};

export const CwkWorkflowLegendEditor = () => {
  const { colors, setColorForType, resetColors } = useWorkflow();

  const [localColors, setLocalColors] = useState(colors);

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
    resetColors();
    setLocalColors(colors);
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
