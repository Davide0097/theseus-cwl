import { Input } from "@theseus-cwl/types";

import { useWorkflowState } from "../../hooks";
import { normalizeInput } from "../../utils";

export type InputNodeComponentProps =
  | { mode: "placeholder"; color: string }
  | { mode: "input"; input: Input & { __key: string }; color: string };

export const InputNodeComponent = (props: InputNodeComponentProps) => {
  const { mode, color } = props;

  const { addInput } = useWorkflowState();

  if (mode === "input") {
    const { input } = props;
    const refeerToFile =
      input && (normalizeInput(input).type === "File" || normalizeInput(input).type === "Directory");

    return (
      <div className="input-node-card">
        <div className="input-node-card-header">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{ backgroundColor: color }}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
          <h1>{input.__key}</h1>
        </div>
        <div
          className="input-node-card-badge"
          style={{ backgroundColor: color }}
        >
          {typeof normalizeInput(input).type === "object"
            ? JSON.stringify(normalizeInput(input).type)
            : normalizeInput(input).type}
        </div>
        <div className="input-node-card-info">Input Parameter</div>
        {refeerToFile && <div className="handle"></div>}
      </div>
    );
  }

  if (mode === "placeholder") {
    return (
      <div onClick={addInput} className="node-component-placeholder">
        <span>+ New input node</span>
      </div>
    );
  }
};
