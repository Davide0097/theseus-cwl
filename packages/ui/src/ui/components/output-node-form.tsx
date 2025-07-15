import { useState } from "react";

import { Output } from "@theseus-cwl/types";

export type OutputNodeFormProps = {
  output?: Output;
};

export const OutputNodeForm = (props: OutputNodeFormProps) => {
  const { output } = props;

  const [type, setType] = useState(output?.type || "");

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
