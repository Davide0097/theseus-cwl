import { createContext } from "react";

import { CWLObject, Input } from "@theseus-cwl/types";

export type CwlObjectContextType = {
  cwlObject: CWLObject;
  setCwlObject: React.Dispatch<React.SetStateAction<CWLObject>>;
  updateInput: (
    id: string,
    updatedData: Partial<Input> & { id: string }
  ) => void;
  addInput: () => void;
  addStep: () => void;
  addOutput: () => void;
  onChange: () => void;
};

export const CwlObjectContext = createContext<CwlObjectContextType | undefined>(
  undefined
);
