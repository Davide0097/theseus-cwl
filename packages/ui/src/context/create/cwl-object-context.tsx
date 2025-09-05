import { createContext } from "react";

import { CWLObject, HasKey, Input, Output, Step } from "@theseus-cwl/types";

import { ColorState } from "../../hooks";

export type CwlObjectContextType = {
  /** The main CWL workflow state */
  cwlObject: CWLObject;

  /** Updates the main CWL workflow state */
  setCwlObject: React.Dispatch<React.SetStateAction<CWLObject>>;

  /**
   * Updates an existing input, returns true when successfull
   * NOTE: This package is intended to be a 'viewer' and not an 'editor'.
   * Editing behaviors are used internally as a possible evolution of the project.
   * They must not be considered part of the public API.
   * */
  updateInput: (
    id: string,
    updatedData: Partial<Input & HasKey>
  ) => boolean | Promise<boolean>;

  /**
   * Updates an existing step, returns true when successfull
   * NOTE: This package is intended to be a 'viewer' and not an 'editor'.
   * Editing behaviors are used internally as a possible evolution of the project.
   * They must not be considered part of the public API.
   * */
  updateStep: (
    id: string,
    updatedData: Partial<Step & HasKey>
  ) => boolean | Promise<boolean>;

  /**
   * Updates an existing output, returns true when successfull
   * NOTE: This package is intended to be a 'viewer' and not an 'editor'.
   * Editing behaviors are used internally as a possible evolution of the project.
   * They must not be considered part of the public API.
   * */
  updateOutput: (
    id: string,
    updatedData: Partial<Output & HasKey>
  ) => boolean | Promise<boolean>;

  /**
   * Adds a new input, returns true when successfull
   * NOTE: This package is intended to be a 'viewer' and not an 'editor'.
   * Editing behaviors are used internally as a possible evolution of the project.
   * They must not be considered part of the public API.
   * */
  addInput: () => boolean | Promise<boolean>;

  /**
   * Adds a new step, returns true when successfull
   * NOTE: This package is intended to be a 'viewer' and not an 'editor'.
   * Editing behaviors are used internally as a possible evolution of the project.
   * They must not be considered part of the public API.
   * */
  addStep: () => boolean | Promise<boolean>;

  /**
   * Adds a new output, returns true when successfull
   * NOTE: This package is intended to be a 'viewer' and not an 'editor'.
   * Editing behaviors are used internally as a possible evolution of the project.
   * They must not be considered part of the public API.
   * */
  addOutput: () => boolean | Promise<boolean>;

  /** The main node color state */
  colors: ColorState;

  /** Updates the main color state */
  setColors: React.Dispatch<React.SetStateAction<ColorState>>;

  /** Reset the colors to the initial state, the one configure or the default one */
  resetColors: () => void;
};

export const CwlObjectContext = createContext<CwlObjectContextType | undefined>(
  undefined
);
