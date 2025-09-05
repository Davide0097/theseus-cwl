import { useEffect, useState } from "react";

import { Output, Step } from "@theseus-cwl/types";

import { useRenderField, useWorkflowState } from "../../hooks";
import { hexToRgba } from "../../utils";

export type OutputNodeFormProps = {
  output: Output & { __key: string };
  readOnly: boolean;
};

export const OutputNodeForm = (props: OutputNodeFormProps) => {
  const { output, readOnly } = props;
  const { colors, updateOutput } = useWorkflowState();

  const [formState, setFormState] = useState<Output>({} as Output);
  const [initialValues, setInitialValues] = useState<Output>({} as Output);

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

  const handleOnClick = () => {
    updateOutput(output.__key, { ...formState, __key: output.__key });
  };

  return (
    <div className="output-node-form">
      <div className="output-node-form-header">
        <svg
          style={{ background: hexToRgba(colors.output, 0.4) }}
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
          {!readOnly ? "Edit" : ""} {output.__key}
        </h2>
      </div>
      {Object.entries(formState).map(([key, value]) => (
        <div key={key} className="output-node-form-form-field">
          <label>{key}:</label>
          {renderField(key as keyof Step, value)}
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
