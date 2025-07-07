import { SetStateAction, useEffect, useState } from "react";
import {
  ComplexType,
  CWLWorkflow,
  PrimitiveType,
  SpecialType,
} from "../cwl-editor";
import { InputNodeComponentProps } from "./input-node";

export type InputNodeFormProps = InputNodeComponentProps & {
  cwlWorkflow: CWLWorkflow;
  setCwlWorkflow: React.Dispatch<SetStateAction<CWLWorkflow | null>>;
};

export const InputNodeForm = (props: InputNodeFormProps) => {
  const [id, setId] = useState<string>("");
  const [type, setType] = useState<
    PrimitiveType | ComplexType | SpecialType | undefined
  >(undefined);
  const [defaultValue, setDefaultValue] = useState<string>("");
  const [initialValues, setInitialValues] = useState<{
    key: "";
    type: typeof type;
    default: typeof defaultValue;
  }>({
    key: "",
    type: undefined,
    default: "",
  });

  useEffect(() => {
    const key = props.input?.key;
    const type = props.input?.type;
    const defaultVal = props.input?.default || "";
    setId(key);
    setType(type);
    setDefaultValue(defaultVal);
    setInitialValues({ key, type, default: defaultVal });
  }, [props.input]);

  const hasChanged =
    id !== initialValues.key ||
    type !== initialValues.type ||
    defaultValue !== initialValues.default;

  const handleOnClick = () => {
    if (props.input) {
      props.cwlWorkflow.editInput(
        props.input.key,
        {
          id: id,
          type: type,
          default: defaultValue,
        },
        props.setCwlWorkflow
      );
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Edit Input Node</h2>
      <div style={styles.formGroup}>
        <label style={styles.label}>ID:</label>
        <input
          style={styles.input}
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Type:</label>
        <input
          style={styles.input}
          type="text"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Default:</label>
        <input
          style={styles.input}
          type="text"
          value={defaultValue}
          onChange={(e) => setDefaultValue(e.target.value)}
        />
      </div>
      {hasChanged && (
        <div style={styles.unsavedWarning}>
          <button style={styles.saveButton} onClick={handleOnClick}>
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "400px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    textAlign: "center",
    color: "#333",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column" as const,
    marginBottom: "15px",
  },
  label: {
    marginBottom: "5px",
    fontWeight: "bold",
    color: "#555",
  },
  input: {
    padding: "8px",
    fontSize: "14px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  unsavedWarning: {
    marginTop: "20px",
    textAlign: "center" as const,
  },
  saveButton: {
    padding: "10px 15px",
    backgroundColor: "#ff9800",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
