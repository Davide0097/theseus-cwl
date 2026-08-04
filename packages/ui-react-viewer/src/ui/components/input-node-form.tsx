import { useEffect, useState } from "react";

import { ExtendedInput, Input } from "@theseus-cwl/types";

import { useCwlFileState, useRenderField } from "../../hooks";
import { hexToRgba } from "../../utils";
import { InputIcon } from "./icons";

export type InputNodeFormProps = {
  input: Input;
  readOnly: boolean;
};

export const InputNodeForm = (props: InputNodeFormProps) => {
  const { input, readOnly } = props;

  const { colors } = useCwlFileState();
  const [formState, setFormState] = useState<ExtendedInput>(input);
  const [initialValues, setInitialValues] = useState<ExtendedInput>(input);

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
        <InputIcon color={colors.input} />
        <h2>
          {!readOnly ? "Edit" : ""} {initialValues.id}
        </h2>
      </div>
      {Object.entries(formState).map(([key, value]) => (
        <div key={key} className="input-node-form-form-field">
          <label>{key}:</label>
          {renderField(
            key as keyof Input,
            value as string | number | boolean | object,
          )}
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
