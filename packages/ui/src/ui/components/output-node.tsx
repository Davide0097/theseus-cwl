import { Output } from "@theseus-cwl/types";

import { useWorkflowState } from "../../hooks";

export type OutputNodeComponentProps =
  | { mode: "placeholder"; color: string,isSubWorkflow?:boolean }
  | { mode: "output"; output: Output & { __key: string }; color: string,isSubWorkflow?:boolean };

export const OutputNodeComponent = (props: OutputNodeComponentProps) => {
  const { mode, color,isSubWorkflow } = props;
  const { addOutput } = useWorkflowState();

  if (mode === "output") {
    const { output } = props;

    return (
      <div className="output-node-card">
        <div className="output-node-card-header">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            style={{ backgroundColor: color }}
          >
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="6"></circle>
            <circle cx="12" cy="12" r="2"></circle>
          </svg>
          {!isSubWorkflow && <h1>{output.__key}</h1>}
        </div>
       {!isSubWorkflow&& <div
          className="output-node-card-badge"
          style={{ backgroundColor: color }}
        >
          {typeof output.type === "object"
            ? JSON.stringify(output.type)
            : output.type}
        </div>}
      </div>
    );
  }

  if (mode === "placeholder") {
    return (
      <div onClick={addOutput} className="node-component-placeholder">
        <span>+ New output node</span>
      </div>
    );
  }
};
