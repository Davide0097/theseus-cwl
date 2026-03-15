import { useCallback } from "react";

import { Input, WorkflowOutput, WorkflowStep } from "@theseus-cwl/types";

type FieldType = keyof Input | keyof WorkflowStep | keyof WorkflowOutput;

export const useRenderField = (
  handleChange: (
    field: FieldType,
    value: string | number | Record<string, never> | Array<string>,
  ) => void,
  readOnly: boolean,
) => {
  const renderField = useCallback(
    (field: FieldType, value: string | number | boolean | object) => {
      if (typeof value === "string" || typeof value === "number") {
        return (
          <input
            readOnly={readOnly}
            type="text"
            value={String(value)}
            onChange={(event) => handleChange(field, event.target.value)}
          />
        );
      }

      if (Array.isArray(value)) {
        return (
          <input
            readOnly={readOnly}
            type="text"
            value={value.join(", ")}
            onChange={(event) =>
              handleChange(
                field,
                event.target.value.split(",").map((string) => string.trim()),
              )
            }
          />
        );
      }

      if (typeof value === "object" && value !== null) {
        return (
          <textarea
            readOnly={readOnly}
            value={JSON.stringify(value, null, 2)}
            onChange={(event) => {
              try {
                handleChange(field, JSON.parse(event.target.value));
              } catch {
                // Ignore JSON parse errors until valid
              }
            }}
            rows={4}
          />
        );
      }

      return null;
    },
    [handleChange, readOnly],
  );

  return { renderField };
};
