import {   useEffect, useState } from "react";

import { ComplexType, PrimitiveType, SpecialType } from "@theseus-cwl/types";

import { useWorkflow } from "../../hooks";
import { InputNodeComponentProps } from "./input-node";

export type InputNodeFormProps = InputNodeComponentProps & {
 
};

export const InputNodeForm = (props: InputNodeFormProps) => {
  const { updateInput } = useWorkflow();

  const [id, setId] = useState<string>("");
  const [type, setType] = useState<
    PrimitiveType | ComplexType | SpecialType | undefined
  >(undefined);
  const [defaultValue, setDefaultValue] = useState<string>("");
  const [initialValues, setInitialValues] = useState<{
    key: typeof id;
    type: typeof type;
    default: typeof defaultValue;
  }>({
    key: "",
    type: undefined,
    default: "",
  });

  useEffect(() => {
    const key = props.input?.__key || "";
    const type = props.input?.type;
    const _default = props.input?.default || "";
    setId(key);
    setType(type);
    setDefaultValue(_default);
    setInitialValues({ key, type, default: _default });
  }, [props.input]);

  const hasChanged =
    id !== initialValues.key ||
    type !== initialValues.type ||
    defaultValue !== initialValues.default;

  const handleOnClick = () => {
    if (props.input) {
      updateInput(props.input.__key!, {
        id: id,
        type: type,
        default: defaultValue,
      });
    }
  };

  return (
    <div className="input-node-form">
      <h2>Edit Input Node</h2>
      <div className="input-node-form-form-field">
        <label>ID:</label>
        <input
          type="text"
          value={id}
          onChange={(event) => setId(event.target.value)}
        />
      </div>
      <div className="input-node-form-form-field">
        <label>Type:</label>
        <input
          type="text"
          value={type}
          onChange={(event) => setType(event.target.value as PrimitiveType | ComplexType | SpecialType)}
        />
      </div>
      <div className="input-node-form-form-field">
        <label>Default:</label>
        <input
          type="text"
          value={defaultValue}
          onChange={(e) => setDefaultValue(e.target.value)}
        />
      </div>
      {hasChanged && (
        <div className="input-node-form-save-button">
          <button onClick={handleOnClick}>Save Changes</button>
        </div>
      )}
    </div>
  );
};
