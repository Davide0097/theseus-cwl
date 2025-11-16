import { WorkflowStep } from "@theseus-cwl/types";
import { Handle, Position } from "@xyflow/react";

import { useWorkflowState } from "../../hooks";

export type StepNodeComponentProps =
  | { mode: "placeholder"; color: string , isSubWorkflow: boolean }
  | { mode: "step"; step: WorkflowStep & { __key: string }; color: string ,isSubWorkflow: boolean};

export const StepNodeComponent = (props: StepNodeComponentProps) => {
  const { mode, color,isSubWorkflow } = props;
  const { addStep } = useWorkflowState();

  if (mode === "step") {
    const { step } = props;

    return (
      <div className="step-node-card">
        <div className="step-node-card-header">
          <svg
            style={{ backgroundColor: color }}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"></path>
            <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
            <path d="M12 2v2"></path>
            <path d="M12 22v-2"></path>
            <path d="m17 20.66-1-1.73"></path>
            <path d="M11 10.27 7 3.34"></path>
            <path d="m20.66 17-1.73-1"></path>
            <path d="m3.34 7 1.73 1"></path>
            <path d="M14 12h8"></path>
            <path d="M2 12h2"></path>
            <path d="m20.66 7-1.73 1"></path>
            <path d="m3.34 17 1.73-1"></path>
            <path d="m17 3.34-1 1.73"></path>
            <path d="m11 13.73-4 6.93"></path>
          </svg>
        {!isSubWorkflow &&   <h1>{step.__key}</h1>}
        </div>
     {!isSubWorkflow &&   <div
          className="step-node-card-badge"
          style={{ backgroundColor: color }}
        >
          step
        </div>}
        {!isSubWorkflow&&<div className="step-node-card-info">
          Run: {typeof step.run === "string" ? step.run : step.run.id || ""}
        </div>}   {/* RIGHT handle = subworkflow link */}

 
 <Handle
  type="source"
  id="bottom"
  position={Position.Bottom}
  style={{ background: "#333" }}
/>

<Handle
  type="source"
  id="right"
  position={Position.Right}
  style={{ background: "#333" }}
/>
      </div>
    );
  }

  if (mode === "placeholder") {
    return (
      <div onClick={addStep} className="node-component-placeholder">
        <span>+ New step node</span>
      </div>
    );
  }
};
