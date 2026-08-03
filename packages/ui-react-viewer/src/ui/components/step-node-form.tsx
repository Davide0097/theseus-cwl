import { useEffect, useState } from "react";

import { WorkflowStep } from "@theseus-cwl/types";

import { useCwlFileState, useRenderField } from "../../hooks";
import { hexToRgba } from "../../utils";
import { StepIcon } from "./icons";

export type StepNodeFormProps = {
  step: WorkflowStep;
  readOnly: boolean;
};

export const StepNodeForm = (props: StepNodeFormProps) => {
  const { step, readOnly } = props;

  const { colors } = useCwlFileState();
  const [formState, setFormState] = useState<WorkflowStep>(step);
  const [initialValues, setInitialValues] = useState<WorkflowStep>(step);

  useEffect(() => {
    setFormState(step);
    setInitialValues(step);
  }, [step]);

  const { renderField } = useRenderField((field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, readOnly);

  const hasChanged =
    JSON.stringify(formState) !== JSON.stringify(initialValues);

  const handleOnClick = () => {};

  return (
    <div className="step-node-form">
      <div className="step-node-form-header">
        <StepIcon color={colors.step} />
        <h2>
          {!readOnly ? "Edit" : ""} {step.id}
        </h2>
      </div>
      {Object.entries(formState).map(([key, value]) => (
        <div key={key} className="step-node-form-form-field">
          <label>{key}:</label>
          {renderField(key as keyof WorkflowStep, value)}
        </div>
      ))}
      {hasChanged && !readOnly && (
        <div className="step-node-form-save-button">
          <button
            onClick={handleOnClick}
            style={{ backgroundColor: hexToRgba(colors.step, 0.4) }}
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};
