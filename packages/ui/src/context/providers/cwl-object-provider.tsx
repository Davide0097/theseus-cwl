import { useEffect, useState } from "react";

import { CWLObject, HasKey, Input, Output, Step } from "@theseus-cwl/types";

import { ColorState, useColorState } from "../../hooks";
import { CwlObjectContext } from "../create";

export type WorflowProviderProps = {
  children: React.ReactNode;
  initialCwlObject: CWLObject;
  initialColorState?: ColorState;
};

export const WorkflowProvider = (props: WorflowProviderProps) => {
  const [cwlObject, setCwlObject] = useState<CWLObject>(props.initialCwlObject);
  const { colors, setColors, resetColors } = useColorState({
    initialColorState: props.initialColorState,
  });

  useEffect(() => {
    setCwlObject(props.initialCwlObject);
  }, [props.initialCwlObject]);

  /**
   * NOTE: This package is intended to be a 'viewer' and not an 'editor'.
   * Editing behaviors are used internally as a possible evolution of the project.
   * They must not be considered part of the public API.
   */
  const updateInput = (id: string, updatedData: Partial<Input & HasKey>) => {
    try {
      setCwlObject((prev) => {
        const inputs = { ...prev.inputs };

        if (inputs[id]) {
          const newId = updatedData.__key!;
          if (newId !== id && inputs[newId]) {
            /** The user is trying to assign an already existent id to an input */
            console.log(`Input "${newId}" already exists.`);
            return prev;
          }

          if (newId !== id) {
            inputs[newId] = { ...inputs[id] };
            delete inputs[id];
          }

          inputs[newId] = {
            ...inputs[newId]!,
            ...updatedData,
          };

          return { ...prev, input: inputs };
        }
        return prev;
      });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  /**
   * NOTE: This package is intended to be a 'viewer' and not an 'editor'.
   * Editing behaviors are used internally as a possible evolution of the project.
   * They must not be considered part of the public API.
   */
  const updateStep = (id: string, updatedData: Partial<Step & HasKey>) => {
    try {
      setCwlObject((prev) => {
        const steps = { ...prev.steps };

        if (steps[id]) {
          const newId = updatedData.__key!;
          if (newId !== id && steps[newId]) {
            /** The user is trying to assign an already existent id to a step */
            console.log(`Step "${newId}" already exists.`);
            return prev;
          }

          if (newId !== id) {
            steps[newId] = { ...steps[id] };
            delete steps[id];
          }

          steps[newId] = {
            ...steps[newId]!,
            ...updatedData,
          };

          return { ...prev, steps: steps };
        }
        return prev;
      });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  /**
   * NOTE: This package is intended to be a 'viewer' and not an 'editor'.
   * Editing behaviors are used internally as a possible evolution of the project.
   * They must not be considered part of the public API.
   */
  const updateOutput = (id: string, updatedData: Partial<Output & HasKey>) => {
    try {
      setCwlObject((prev) => {
        const outputs = { ...prev.outputs };

        if (outputs[id]) {
          const newId = updatedData.__key!;
          if (newId !== id && outputs[newId]) {
            /** The user is trying to assign an already existent id to an output */
            console.log(`Output "${newId}" already exists.`);
            return prev;
          }

          if (newId !== id) {
            outputs[newId] = { ...outputs[id] };
            delete outputs[id];
          }

          outputs[newId] = {
            ...outputs[newId]!,
            ...updatedData,
          };

          return { ...prev, outputs: outputs };
        }
        return prev;
      });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  /**
   * NOTE: This package is intended to be a 'viewer' and not an 'editor'.
   * Editing behaviors are used internally as a possible evolution of the project.
   * They must not be considered part of the public API.
   */
  const addInput = () => {
    try {
      const randomId = `input_${Date.now()}`;
      setCwlObject((prev) => ({
        ...prev,
        inputs: {
          ...prev.inputs,
          [randomId]: {
            __key: randomId,
            type: "string",
            label: "New Input",
          },
        },
      }));
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  /**
   * NOTE: This package is intended to be a 'viewer' and not an 'editor'.
   * Editing behaviors are used internally as a possible evolution of the project.
   * They must not be considered part of the public API.
   */
  const addStep = () => {
    try {
      const randomId = `step_${Date.now()}`;
      setCwlObject((prev) => ({
        ...prev,
        steps: {
          ...prev.steps,
          [randomId]: {
            __key: randomId,
            run: "./tool.cwl",
            in: {},
            out: "output",
          },
        },
      }));
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  /**
   * NOTE: This package is intended to be a 'viewer' and not an 'editor'.
   * Editing behaviors are used internally as a possible evolution of the project.
   * They must not be considered part of the public API.
   */
  const addOutput = () => {
    try {
      const randomId = `output_${Date.now()}`;
      setCwlObject((prev) => ({
        ...prev,
        outputs: {
          ...prev.outputs,
          [randomId]: {
            type: "string",
            __key: randomId,
          },
        },
      }));
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  return (
    <CwlObjectContext.Provider
      value={{
        cwlObject,
        setCwlObject,
        updateInput,
        updateStep,
        updateOutput,
        addInput,
        addStep,
        addOutput,
        colors,
        setColors,
        resetColors,
      }}
    >
      {props.children}
    </CwlObjectContext.Provider>
  );
};
