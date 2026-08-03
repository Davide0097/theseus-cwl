import { WorkflowStep } from "@theseus-cwl/types";
import { Position } from "@xyflow/react";

import { useCwlFileState } from "../../hooks";
import { Handle_ } from "./handle";
import { StepIcon } from "./icons";

export type StepNodeComponentProps =
  | { mode: "placeholder"; isSubWorkflow: boolean }
  | { mode: "step"; step: WorkflowStep; isSubWorkflow: boolean };

export const StepNodeComponent = (props: StepNodeComponentProps) => {
  const { mode, isSubWorkflow } = props;

  const { colors, addStep } = useCwlFileState();

  if (mode === "step") {
    const { step } = props;
    const runLabel =
      typeof step.run === "string" ? step.run : step.run.id || "";

    return (
      <div className="step-node-card">
        <div className="step-node-card-header">
          <StepIcon color={colors.step} />
          <h1>{step.id}</h1>
        </div>
        {!isSubWorkflow && (
          <div
            className="step-node-card-badge"
            style={{ backgroundColor: colors.step }}
          >
            step
          </div>
        )}
        {!isSubWorkflow && (
          <div className="step-node-card-info">Run: {runLabel}</div>
        )}
        {/* RIGHT handle = subworkflow link */}
        <Handle_ type="source" id="bottom" position={Position.Bottom} />
        <Handle_ type="source" id="right" position={Position.Right} />
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
