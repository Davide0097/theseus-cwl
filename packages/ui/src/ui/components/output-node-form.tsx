import { useEffect, useState } from "react";

import { WorkflowOutput, WorkflowStep } from "@theseus-cwl/types";

import { useCwlFileState, useRenderField } from "../../hooks";
import { hexToRgba } from "../../utils";

export type OutputNodeFormProps = {
  output: WorkflowOutput;
  readOnly: boolean;
};

export const OutputNodeForm = (props: OutputNodeFormProps) => {
  const { output, readOnly } = props;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { colors, updateOutput } = useCwlFileState();

  const [formState, setFormState] = useState<WorkflowOutput>(
    {} as WorkflowOutput,
  );
  const [initialValues, setInitialValues] = useState<WorkflowOutput>(
    {} as WorkflowOutput,
  );

  useEffect(() => {
    setFormState(output);
    setInitialValues(output);
  }, [output]);

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
    <div className="output-node-form">
      <div className="output-node-form-header">
        <svg
          style={{ backgroundColor: hexToRgba(colors.output, 0.4) }}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="6"></circle>
          <circle cx="12" cy="12" r="2"></circle>
        </svg>
        <h2>
          {!readOnly ? "Edit" : ""} {output.id}
        </h2>
      </div>
      {Object.entries(formState).map(([key, value]) => (
        <div key={key} className="output-node-form-form-field">
          <label>{key}:</label>
          {renderField(key as keyof WorkflowStep, value)}
        </div>
      ))}
      {hasChanged && !readOnly && (
        <div className="output-node-form-save-button">
          <button
            onClick={handleOnClick}
            style={{ backgroundColor: hexToRgba(colors.output, 0.4) }}
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};
