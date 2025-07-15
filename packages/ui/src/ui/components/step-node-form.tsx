import { Step } from "@theseus-cwl/types";
import { useState } from "react";

/**
 *
 */
export type StepNodeFormProps = {
  step: Step;
};

/**
 *
 */
export const StepNodeForm = (props: StepNodeFormProps) => {
  const step = props.step;
  const [run, setRun] = useState(step?.content.run || "");
  const [outputs, setOutputs] = useState(step?.content.out || "");
  const [inputs, setInputs] = useState(step?.content.in || {});

  return (
    <div>
      <h2>Step Node</h2>
      <label>
        Run:
        <input
          type="text"
          value={run}
          onChange={(e) => setRun(e.target.value)}
        />
      </label>
      <br />
      <h3>Inputs:</h3>
      {Object.entries(inputs).map(([key, value]) => (
        <div key={key}>
          <strong>{key}:</strong>
          <input
            type="text"
            value={value.source}
            onChange={(e) => {
              setInputs({
                ...inputs,
                [key]: { source: e.target.value },
              });
            }}
          />
        </div>
      ))}
      <br />
      <label>
        Outputs:
        <input
          type="text"
          value={outputs}
          onChange={(e) => setOutputs(e.target.value)}
        />
      </label>
    </div>
  );
};
