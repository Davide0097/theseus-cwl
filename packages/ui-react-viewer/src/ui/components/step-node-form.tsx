import { useEffect, useState } from "react";

import { WorkflowStep } from "@theseus-cwl/types";

import { useRenderField, useCwlFileState } from "../../hooks";
import { hexToRgba } from "../../utils";

export type StepNodeFormProps = {
  step: WorkflowStep;
  readOnly: boolean;
};

export const StepNodeForm = (props: StepNodeFormProps) => {
  const { step, readOnly } = props;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { colors, updateStep } = useCwlFileState();
  const [formState, setFormState] = useState<WorkflowStep>({} as WorkflowStep);
  const [initialValues, setInitialValues] = useState<WorkflowStep>(
    {} as WorkflowStep,
  );

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
        <svg
          style={{ background: hexToRgba(colors.step, 0.4) }}
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
