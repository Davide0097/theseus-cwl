import { useState } from "react";

/**
 *
 */
export type OutputNodeFormProps = any;

/**
 *
 */
export const OutputNodeForm = (props: OutputNodeFormProps) => {
  const output = props.output;
  const [type, setType] = useState(output?.content.type || "");

  return (
    <div>
      <h2>Output Node</h2>
      <label>
        Type:
        <input
          type="text"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
      </label>
    </div>
  );
};
