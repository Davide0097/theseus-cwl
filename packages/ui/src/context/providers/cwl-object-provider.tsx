import { useEffect, useState } from "react";

import { CWLObject, Input } from "@theseus-cwl/types";

import { CwlObjectContext } from "../create";
import { ColorState, useColorState } from "../../hooks";

export type WorflowProviderProps = {
  children: React.ReactNode;
  initialCwlObject: CWLObject;
  initialColorState?: ColorState;
};

export const WorkflowProvider = (props: WorflowProviderProps) => {
  const [cwlObject, setCwlObject] = useState(props.initialCwlObject);

  useEffect(() => {
    setCwlObject(props.initialCwlObject);
  }, [props.initialCwlObject]);

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
    const randomId = `input_${Date.now()}`;
    setCwlObject((prev) => ({
      ...prev,
      inputs: {
        ...prev.inputs,
        [randomId]: {
          key: randomId,
          type: "string",
          label: "New Input",
        },
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

  const {
    colors,
    setColors,
    setColorForType,
    resetColors,
    onChange,
    pendingDefaultColor,
  } = useColorState({
    initialColorState: props.initialColorState,
  });

  return (
    <CwlObjectContext.Provider
      value={{
        cwlObject,
        setCwlObject,
        addInput,
        updateInput,
        addStep,
        addOutput,
        onChange,
        colors,
        setColors,
        setColorForType,
        resetColors,
        pendingDefaultColor,
      }}
    >
      {props.children}
    </CwlObjectContext.Provider>
  );
};
