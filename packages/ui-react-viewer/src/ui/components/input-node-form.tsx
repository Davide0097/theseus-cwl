import { useEffect, useState } from "react";

import { ExtendedInput, Input } from "@theseus-cwl/types";

import { useCwlFileState, useRenderField } from "../../hooks";
import { hexToRgba } from "../../utils";

export type InputNodeFormProps = {
  input: Input;
  readOnly: boolean;
};

export const InputNodeForm = (props: InputNodeFormProps) => {
  const { input, readOnly } = props;

  const { colors } = useCwlFileState();
  const [formState, setFormState] = useState<ExtendedInput>(
    {} as ExtendedInput,
  );
  const [initialValues, setInitialValues] = useState<ExtendedInput>(
    {} as ExtendedInput,
  );

  useEffect(() => {
    setFormState(input);
    setInitialValues(input);
  }, [input]);

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
          {!readOnly ? "Edit" : ""} {initialValues.id}
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
