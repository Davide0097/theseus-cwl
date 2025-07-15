import { createContext } from "react";

import { CWLObject, Input } from "@theseus-cwl/types";
import { ColorState } from "../../hooks";

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
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  colors: ColorState;
  setColors: any;
  setColorForType: any;
  resetColors: any;
  pendingDefaultColor: any;
};

export const CwlObjectContext = createContext<CwlObjectContextType | undefined>(
  undefined
);
