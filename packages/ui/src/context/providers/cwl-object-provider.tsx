import { useState } from "react";

import { CWLObject, Input } from "../../ui";
import { WorkflowContext } from "../context";

export type WorflowProviderProps = {
  children: React.ReactNode;
  initialCwlObject: CWLObject | undefined;
};

export const WorkflowProvider = (props: WorflowProviderProps) => {
  const [cwlObject, setCwlObject] = useState(props.initialCwlObject);

  const updateInput = (
    id: string,
    updatedData: Partial<Input> & { id: string }
  ) => {
    setCwlObject((prev) => {
      const updated = { ...prev.inputs };

      if (updated[id]) {
        const newId = updatedData.id;
        if (newId !== id && updated[newId]) {
          console.warn(`Input "${newId}" already exists.`);
          return prev;
        }

        if (newId !== id) {
          updated[newId] = { ...updated[id] };
          delete updated[id];
        }

        updated[newId] = {
          ...updated[newId],
          ...updatedData,
        };

        return { ...prev, inputs: updated };
      }
      return prev;
    });
  };

  const addStep = () => {
    setCwlObject((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          id: "step_" + Date.now(),
          content: {
            run: "./tool.cwl",
            in: {},
            out: "output",
          },
        },
      ],
    }));
  };
  const addInput = () => {
    setCwlObject((prev) => ({
      ...prev,
      inputs: {
        ...prev.inputs,
        key: "string",
        ["zip_fileww"]: { type: "string" },
      },
    }));
  };

  const addOutput = () => {
    setCwlObject((prev) => ({
      ...prev,
      outputs: {
        ...prev.outputs,
        ["output_" + Date.now()]: {
          type: "string",
          outputSource: "step_id",
        },
      },
    }));
  };

  return (
    <WorkflowContext.Provider
      value={{ cwlObject, setCwlObject, addInput, updateInput, addStep, addOutput }}
    >
      {props.children}
    </WorkflowContext.Provider>
  );
};
