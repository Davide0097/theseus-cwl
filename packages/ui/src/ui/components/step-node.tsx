import { useWorkflow } from "../../hooks";

import { Step } from "@theseus-cwl/types";

export type StepNodeComponentProps = {
  step?: Step;
};

export const StepNodeComponent = (props: StepNodeComponentProps) => {
  const { step } = props;

  const { addStep, colors } = useWorkflow();

  if (step) {
    return (
      <div className="node-component" style={{ backgroundColor: colors.steps }}>
        <h1 style={{ fontFamily: "monospace" }}> {step.id}</h1>
        <h1>Run: {step.content.run}</h1>
        <h1>In:</h1>
        <div className="input-list">
          {Object.entries(step.content.in).map(([key, value]) => (
            <div key={key} className="input-item">
              <strong>{key}:</strong> <span>{value.source}</span>
            </div>
          ))}
        </div>
        <h1>Out: {step.content.out}</h1>
      </div>
    );
  }

  if (!step) {
    return (
      <div onClick={addStep} className="node-component-placeholder">
        <span>+ New step node</span>
      </div>
    );
  }
};
