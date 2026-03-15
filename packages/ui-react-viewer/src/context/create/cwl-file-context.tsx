import { createContext } from "react";

import {
  CWLPackedDocument,
  Input,
  Workflow,
  WorkflowOutput,
  WorkflowStep,
} from "@theseus-cwl/types";

import { ColorState } from "../../hooks";

export type CwlFileContextType = {
  /** The main CWL file source as object */
  cwlFile: Workflow | CWLPackedDocument;

  /** Updates the main CWL file source state */
  setCwlFile: React.Dispatch<
    React.SetStateAction<Workflow | CWLPackedDocument>
  >;

  /**
   * Adds a new input, returns true when successfull
   * NOTE: This package is intended to be a 'viewer' and not an 'editor'.
   * Editing behaviors are used internally as a possible evolution of the project.
   * They must not be considered part of the public API.
   * */
  addInput?: () => boolean | Promise<boolean>;

  /**
   * Adds a new step, returns true when successfull
   * NOTE: This package is intended to be a 'viewer' and not an 'editor'.
   * Editing behaviors are used internally as a possible evolution of the project.
   * They must not be considered part of the public API.
   * */
  addStep?: () => boolean | Promise<boolean>;

  /**
   * Adds a new output, returns true when successfull
   * NOTE: This package is intended to be a 'viewer' and not an 'editor'.
   * Editing behaviors are used internally as a possible evolution of the project.
   * They must not be considered part of the public API.
   * */
  addOutput?: () => boolean | Promise<boolean>;

  /**
   * Updates an existing input, returns true when successfull
   * NOTE: This package is intended to be a 'viewer' and not an 'editor'.
   * Editing behaviors are used internally as a possible evolution of the project.
   * They must not be considered part of the public API.
   * */
  updateInput?: (
    id: string,
    updatedData: Partial<Input>,
  ) => boolean | Promise<boolean>;

  /**
   * Updates an existing step, returns true when successfull
   * NOTE: This package is intended to be a 'viewer' and not an 'editor'.
   * Editing behaviors are used internally as a possible evolution of the project.
   * They must not be considered part of the public API.
   * */
  updateStep?: (
    id: string,
    updatedData: Partial<WorkflowStep>,
  ) => boolean | Promise<boolean>;

  /**
   * Updates an existing output, returns true when successfull
   * NOTE: This package is intended to be a 'viewer' and not an 'editor'.
   * Editing behaviors are used internally as a possible evolution of the project.
   * They must not be considered part of the public API.
   * */
  updateOutput?: (
    id: string,
    updatedData: Partial<WorkflowOutput>,
  ) => boolean | Promise<boolean>;

  /** The main node color state */
  colors: ColorState;

  /** Updates the main color state */
  setColors: React.Dispatch<React.SetStateAction<ColorState>>;

  /** Reset the colors to the default state */
  resetColors: () => void;
};

export const CwlFileContext = createContext<CwlFileContextType | undefined>(
  undefined,
);
