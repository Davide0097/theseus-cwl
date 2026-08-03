import { useEffect, useState } from "react";

import { WorkflowOutput } from "@theseus-cwl/types";

import { useCwlFileState, useRenderField } from "../../hooks";
import { hexToRgba } from "../../utils";
import { OutputIcon } from "./icons";

export type OutputNodeFormProps = {
  output: WorkflowOutput;
  readOnly: boolean;
};

export const OutputNodeForm = (props: OutputNodeFormProps) => {
  const { output, readOnly } = props;

  const { colors } = useCwlFileState();
  const [formState, setFormState] = useState<WorkflowOutput>(output);
  const [initialValues, setInitialValues] = useState<WorkflowOutput>(output);

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
        <OutputIcon color={colors.output} />
        <h2>
          {!readOnly ? "Edit" : ""} {output.id}
        </h2>
      </div>
      {Object.entries(formState).map(([key, value]) => (
        <div key={key} className="output-node-form-form-field">
          <label>{key}:</label>
          {renderField(key as keyof WorkflowOutput, value)}
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
