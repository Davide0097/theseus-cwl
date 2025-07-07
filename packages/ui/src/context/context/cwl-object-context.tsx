import { createContext } from "react";

import { CWLObject } from "../../ui";

export type WorkflowContextType = {
  cwlObject: CWLObject;
  setCwlObject: React.Dispatch<React.SetStateAction<CWLObject>>;
  updateInput: () => void;
  addInput: () => void;
  addStep: () => void;
  addOutput: () => void;
};

export const WorkflowContext = createContext<WorkflowContextType | undefined>(
  undefined
);
