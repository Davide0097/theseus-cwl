/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";

import {
  CWLPackedDocument,
  Input,
  Workflow,
  WorkflowOutput,
  WorkflowStep,
} from "@theseus-cwl/types";

import { ColorState, useColorState } from "../../hooks";
import { CwlFileContext } from "../create";

export type CwlFileProviderProps = {
  children: React.ReactNode;
  initialCwlFile: Workflow | CWLPackedDocument;
  initialColorState?: ColorState;
};

export const CwlFileProvider = (props: CwlFileProviderProps) => {
  const [cwlFile, setCwlFile] = useState<Workflow | CWLPackedDocument>(
    props.initialCwlFile,
  );
  const { colors, setColors, resetColors } = useColorState({
    initialColorState: props.initialColorState,
  });

  useEffect(() => {
    setCwlFile(props.initialCwlFile);
  }, [props.initialCwlFile]);

  /**
   * NOTE: This package is intended to be a 'viewer' and not an 'editor'.
   * Editing behaviors are used internally as a possible evolution of the project.
   * They must not be considered part of the public API.
   */
  const updateInput = (id: string, updatedData: Partial<Input>) => {
    try {
      setCwlFile((prev) => prev);
      console.warn(
        "This package is intended to be a viewer and not an editor. Editing behaviors are used internally as a possible evolution of the project.They must not be considered part of the public API",
      );
      return false;
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
  const updateStep = (id: string, updatedData: Partial<WorkflowStep>) => {
    try {
      setCwlFile((prev) => prev);
      console.warn(
        "This package is intended to be a viewer and not an editor. Editing behaviors are used internally as a possible evolution of the project.They must not be considered part of the public API",
      );
      return false;
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
  const updateOutput = (id: string, updatedData: Partial<WorkflowOutput>) => {
    try {
      setCwlFile((prev) => prev);
      console.warn(
        "This package is intended to be a viewer and not an editor. Editing behaviors are used internally as a possible evolution of the project.They must not be considered part of the public API",
      );
      return false;
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
      setCwlFile((prev) => prev);
      console.warn(
        "This package is intended to be a viewer and not an editor. Editing behaviors are used internally as a possible evolution of the project.They must not be considered part of the public API",
      );
      return false;
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
      setCwlFile((prev) => prev);
      console.warn(
        "This package is intended to be a viewer and not an editor. Editing behaviors are used internally as a possible evolution of the project.They must not be considered part of the public API",
      );
      return false;
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
      setCwlFile((prev) => prev);
      console.warn(
        "This package is intended to be a viewer and not an editor. Editing behaviors are used internally as a possible evolution of the project.They must not be considered part of the public API",
      );
      return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  return (
    <CwlFileContext.Provider
      value={{
        cwlFile,
        setCwlFile,
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
    </CwlFileContext.Provider>
  );
};
