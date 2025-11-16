import { useEffect, useState } from "react";

import { DefaultInput, Input } from "@theseus-cwl/types";

import { useRenderField, useWorkflowState } from "../../hooks";
import { hexToRgba, normalizeInput } from "../../utils";

export type InputNodeFormProps = {
  input: Input & { __key: string };
  readOnly: boolean;
};

export const InputNodeForm = (props: InputNodeFormProps) => {
  const { input, readOnly } = props;

  const { colors, updateInput } = useWorkflowState();

  const [formState, setFormState] = useState<DefaultInput>({} as DefaultInput);
  const [initialValues, setInitialValues] = useState<DefaultInput>(
    {} as DefaultInput
  );

  useEffect(() => {
    setFormState(normalizeInput(input));
    setInitialValues(normalizeInput(input));
  }, [input]);

  const { renderField } = useRenderField((field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, readOnly);

  const hasChanged =
    JSON.stringify(formState) !== JSON.stringify(initialValues);

  const handleOnClick = () => {
    // updateInput(input.__key, { ...formState, __key: input.__key });
  };

  return (
    <div className="input-node-form">
      <div className="input-node-form-header">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{ backgroundColor: hexToRgba(colors.input, 0.4) }}
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

        <h2>
          {!readOnly ? "Edit" : ""} {input.__key}
        </h2>
      </div>
      {Object.entries(formState).map(([key, value]) => (
        <div key={key} className="input-node-form-form-field">
          <label>{key}:</label>
          {renderField(key as keyof Input, value)}
        </div>
      ))}
      {hasChanged && !readOnly && (
        <div className="input-node-form-save-button">
          <button
            onClick={handleOnClick}
            style={{ backgroundColor: hexToRgba(colors.input, 0.4) }}
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};
